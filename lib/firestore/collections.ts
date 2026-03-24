import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";

const db = () => getFirebaseFirestore();

const COLLECTIONS = {
  users: "users",
  categories: "categories",
  tags: "tags",
  content: "content",
  magazines: "magazines",
  publications: "publications",
} as const;

// ——— User settings (GitHub repo URL) ———
export async function getUserRepoUrl(userId: string): Promise<string | null> {
  const ref = doc(db(), COLLECTIONS.users, userId);
  const snap = await getDoc(ref);
  const data = snap.data();
  return (data?.githubRepoUrl as string) ?? null;
}

export async function setUserRepoUrl(userId: string, url: string | null): Promise<void> {
  const { setDoc } = await import("firebase/firestore");
  const ref = doc(db(), COLLECTIONS.users, userId);
  await setDoc(ref, { githubRepoUrl: url ?? null }, { merge: true });
}

// ——— Public (all users) ———
export async function getAllMagazines(categorySlug?: string, tagName?: string) {
  const constraints: QueryConstraint[] = [];
  if (categorySlug)
    constraints.push(where("categorySlugs", "array-contains", categorySlug));
  if (tagName) constraints.push(where("tagNames", "array-contains", tagName));
  const q =
    constraints.length > 0
      ? query(collection(db(), COLLECTIONS.magazines), ...constraints)
      : query(
          collection(db(), COLLECTIONS.magazines),
          orderBy("updatedAt", "desc")
        );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
    id: string;
    updatedAt?: { toMillis?: () => number };
  }>;
  if (constraints.length > 0) {
    list.sort(
      (a, b) =>
        (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0)
    );
  }
  return list;
}

export async function getMagazineByUserIdAndSlug(
  userId: string,
  slug: string
): Promise<{ id: string; name: string } | null> {
  const q = query(
    collection(db(), COLLECTIONS.magazines),
    where("userId", "==", userId),
    where("slug", "==", slug)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  return { id: snap.docs[0].id, name: (data?.name as string) ?? "" };
}

export async function getPublishedPublicationsForMagazine(
  magazineId: string,
  userId: string
) {
  const q = query(
    collection(db(), COLLECTIONS.publications),
    where("magazineId", "==", magazineId),
    where("userId", "==", userId),
    where("status", "==", "Published")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPublicationByContentSlug(
  userId: string,
  magazineId: string,
  contentSlug: string
) {
  const contentSnap = await getDocs(
    query(
      collection(db(), COLLECTIONS.content),
      where("userId", "==", userId),
      where("slug", "==", contentSlug)
    )
  );
  if (contentSnap.empty) return null;
  const contentId = contentSnap.docs[0].id;
  const pubSnap = await getDocs(
    query(
      collection(db(), COLLECTIONS.publications),
      where("contentId", "==", contentId),
      where("magazineId", "==", magazineId),
      where("status", "==", "Published")
    )
  );
  if (pubSnap.empty) return null;
  const pub = pubSnap.docs[0];
  const pubData = pub.data();
  const contentData = contentSnap.docs[0].data();
  return {
    publication: {
      id: pub.id,
      displayTitle: pubData?.displayTitle as string | undefined,
      publishedAt: pubData?.publishedAt,
    },
    content: {
      id: contentSnap.docs[0].id,
      title: (contentData?.title as string) ?? "",
      body: (contentData?.body as string) ?? "",
      excerpt: contentData?.excerpt as string | undefined,
    },
  };
}

export async function getContentById(
  contentId: string
): Promise<{ id: string; title: string; slug: string } | null> {
  const ref = doc(db(), COLLECTIONS.content, contentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    title: (data?.title as string) ?? "",
    slug: (data?.slug as string) ?? "",
  };
}

export async function getMagazineById(
  magazineId: string
): Promise<{
  id: string;
  name: string;
  slug: string;
  description?: string;
  userId?: string;
  categorySlugs?: string[];
  tagNames?: string[];
} | null> {
  const ref = doc(db(), COLLECTIONS.magazines, magazineId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    name: (data?.name as string) ?? "",
    slug: (data?.slug as string) ?? "",
    description: data?.description as string | undefined,
    userId: data?.userId as string | undefined,
    categorySlugs: data?.categorySlugs as string[] | undefined,
    tagNames: data?.tagNames as string[] | undefined,
  };
}

export async function getPublicationsForContent(
  userId: string,
  contentId: string
): Promise<{ id: string; magazineId: string; status: string; scheduledAt?: unknown; publishedAt?: unknown }[]> {
  const q = query(
    collection(db(), COLLECTIONS.publications),
    where("userId", "==", userId),
    where("contentId", "==", contentId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      magazineId: (data?.magazineId as string) ?? "",
      status: (data?.status as string) ?? "",
      scheduledAt: data?.scheduledAt,
      publishedAt: data?.publishedAt,
    };
  });
}

/**
 * All publications for a magazine (dashboard).
 * Must include userId in the query so Firestore rules can prove every matching doc is readable
 * (rules: Published OR resource.data.userId == request.auth.uid).
 */
export async function getPublicationsForMagazine(
  userId: string,
  magazineId: string
): Promise<
  {
    id: string;
    contentId: string;
    status: string;
    displayTitle?: string | null;
    sortOrder?: number;
    scheduledAt?: unknown;
    publishedAt?: unknown;
  }[]
> {
  const q = query(
    collection(db(), COLLECTIONS.publications),
    where("userId", "==", userId),
    where("magazineId", "==", magazineId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    const so = data?.sortOrder;
    return {
      id: d.id,
      contentId: (data?.contentId as string) ?? "",
      status: (data?.status as string) ?? "",
      displayTitle: data?.displayTitle as string | null | undefined,
      sortOrder: typeof so === "number" && !Number.isNaN(so) ? so : undefined,
      scheduledAt: data?.scheduledAt,
      publishedAt: data?.publishedAt,
    };
  });
}

export async function updatePublicationDisplayTitle(
  publicationId: string,
  displayTitle: string | null
): Promise<void> {
  await updateDoc(doc(db(), COLLECTIONS.publications, publicationId), {
    displayTitle: displayTitle?.trim() ? displayTitle.trim() : null,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePublication(publicationId: string): Promise<void> {
  await deleteDoc(doc(db(), COLLECTIONS.publications, publicationId));
}

/** Persist order: first id in the array is sortOrder 0, etc. */
export async function setMagazinePublicationSortOrder(orderedPublicationIds: string[]): Promise<void> {
  const fs = db();
  const batch = writeBatch(fs);
  orderedPublicationIds.forEach((id, index) => {
    batch.update(doc(fs, COLLECTIONS.publications, id), {
      sortOrder: index,
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

// ——— Per-user (dashboard) ———
export async function getUserCategories(userId: string) {
  const q = query(
    collection(db(), COLLECTIONS.categories),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as { id: string; name: string; slug: string }[];
  list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return list;
}

export async function getUserTags(userId: string) {
  const q = query(
    collection(db(), COLLECTIONS.tags),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as { id: string; name: string }[];
  list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return list;
}

export async function getUserContent(
  userId: string,
  filters?: { categorySlug?: string; tagNames?: string[] }
) {
  const q = query(
    collection(db(), COLLECTIONS.content),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  let docs = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as (DocumentData & { id: string; tagIds?: string[]; categoryId?: string })[];
  if (filters?.categorySlug) {
    const categories = await getUserCategories(userId);
    const cat = categories.find((c: DocumentData) => c.slug === filters.categorySlug);
    if (cat) docs = docs.filter((d) => d.categoryId === (cat as { id: string }).id);
  }
  if (filters?.tagNames?.length) {
    const tags = await getUserTags(userId);
    const tagIds = (filters.tagNames as string[])
      .map((n) => tags.find((t: DocumentData) => t.name === n)?.id)
      .filter(Boolean);
    docs = docs.filter((d) =>
      (d.tagIds || []).some((id: string) => tagIds.includes(id))
    );
  }
  docs.sort(
    (a, b) =>
      (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0)
  );
  return docs;
}

export async function getUserMagazines(userId: string) {
  const q = query(
    collection(db(), COLLECTIONS.magazines),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as { id: string; name: string; slug: string }[];
  list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  return list;
}

export async function getUserContentById(
  userId: string,
  contentId: string
): Promise<{ id: string; categoryId: string; title: string; excerpt?: string; tagIds: string[] } | null> {
  const ref = doc(db(), COLLECTIONS.content, contentId);
  const snap = await getDoc(ref);
  if (!snap.exists() || snap.data()?.userId !== userId) return null;
  const data = snap.data();
  return {
    id: snap.id,
    categoryId: data?.categoryId ?? "",
    title: data?.title ?? "",
    excerpt: data?.excerpt,
    tagIds: (data?.tagIds as string[]) ?? [],
  };
}

export async function getUserPublications(userId: string, status?: "Scheduled" | "Published") {
  let q = query(
    collection(db(), COLLECTIONS.publications),
    where("userId", "==", userId)
  );
  if (status) q = query(q, where("status", "==", status));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
    id: string;
    scheduledAt?: { toMillis?: () => number };
  }>;
  list.sort((a, b) => (a.scheduledAt?.toMillis?.() ?? 0) - (b.scheduledAt?.toMillis?.() ?? 0));
  return list;
}

// ——— Create / Update ———
export async function createCategory(userId: string, name: string, slug: string) {
  const ref = await addDoc(collection(db(), COLLECTIONS.categories), {
    userId,
    name,
    slug,
  });
  return ref.id;
}

export async function createTag(userId: string, name: string) {
  const existing = await getDocs(
    query(
      collection(db(), COLLECTIONS.tags),
      where("userId", "==", userId),
      where("name", "==", name.toLowerCase())
    )
  );
  if (!existing.empty) return existing.docs[0].id;
  const ref = await addDoc(collection(db(), COLLECTIONS.tags), {
    userId,
    name: name.toLowerCase(),
  });
  return ref.id;
}

export async function createMagazine(
  userId: string,
  data: { name: string; slug: string; description?: string }
) {
  const ref = await addDoc(collection(db(), COLLECTIONS.magazines), {
    userId,
    ...data,
    categorySlugs: [],
    tagNames: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function createContent(
  userId: string,
  data: {
    title: string;
    slug: string;
    body: string;
    excerpt?: string;
    categoryId: string;
    tagIds: string[];
  }
) {
  const ref = await addDoc(collection(db(), COLLECTIONS.content), {
    userId,
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateContent(
  contentId: string,
  data: Partial<{
    title: string;
    slug: string;
    body: string;
    excerpt: string;
    categoryId: string;
    tagIds: string[];
  }>
) {
  await updateDoc(doc(db(), COLLECTIONS.content, contentId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function upsertPublication(
  userId: string,
  data: {
    contentId: string;
    magazineId: string;
    status: string;
    displayTitle?: string | null;
    scheduledAt?: Date | null;
    publishedAt?: Date | null;
  }
) {
  const existing = await getDocs(
    query(
      collection(db(), COLLECTIONS.publications),
      where("userId", "==", userId),
      where("contentId", "==", data.contentId),
      where("magazineId", "==", data.magazineId)
    )
  );
  const payload = {
    ...data,
    displayTitle: data.displayTitle?.trim() || null,
    scheduledAt: data.scheduledAt ?? null,
    publishedAt: data.publishedAt ?? null,
    updatedAt: serverTimestamp(),
  };
  if (!existing.empty) {
    await updateDoc(doc(db(), COLLECTIONS.publications, existing.docs[0].id), payload);
    return existing.docs[0].id;
  }
  const siblingsSnap = await getDocs(
    query(
      collection(db(), COLLECTIONS.publications),
      where("userId", "==", userId),
      where("magazineId", "==", data.magazineId)
    )
  );
  let maxOrder = -1;
  siblingsSnap.forEach((d) => {
    const o = d.data().sortOrder;
    if (typeof o === "number" && !Number.isNaN(o)) maxOrder = Math.max(maxOrder, o);
  });
  const ref = await addDoc(collection(db(), COLLECTIONS.publications), {
    userId,
    ...payload,
    sortOrder: maxOrder + 1,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMagazineCategoryAndTagSlugs(
  magazineId: string,
  categorySlugs: string[],
  tagNames: string[]
) {
  await updateDoc(doc(db(), COLLECTIONS.magazines, magazineId), {
    categorySlugs,
    tagNames,
    updatedAt: serverTimestamp(),
  });
}

export async function addMagazineSlugsForPublish(
  magazineId: string,
  categorySlug: string,
  tagNames: string[]
) {
  const mag = await getMagazineById(magazineId);
  if (!mag) return;
  const currentSlugs = (mag.categorySlugs as string[]) || [];
  const currentTags = (mag.tagNames as string[]) || [];
  const newSlugs = currentSlugs.includes(categorySlug)
    ? currentSlugs
    : [...currentSlugs, categorySlug];
  const newTags = [...currentTags];
  for (const t of tagNames) {
    if (!newTags.includes(t)) newTags.push(t);
  }
  await updateMagazineCategoryAndTagSlugs(magazineId, newSlugs, newTags);
}
