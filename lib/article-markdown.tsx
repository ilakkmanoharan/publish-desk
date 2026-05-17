import type { Components } from "react-markdown";
import rehypeRaw from "rehype-raw";

/** Allow trusted editorial HTML (e.g. embedded video) in synced Markdown bodies. */
export const articleMarkdownRehypePlugins = [rehypeRaw];

export const articleMarkdownComponents: Components = {
  video: ({ node: _node, ...props }) => (
    <video
      {...props}
      controls
      playsInline
      preload="metadata"
      className="my-6 w-full rounded-xl border border-border bg-black/90 shadow-md"
    />
  ),
  source: (props) => <source {...props} />,
};
