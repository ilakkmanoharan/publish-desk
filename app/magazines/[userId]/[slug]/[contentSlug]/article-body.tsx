import ReactMarkdown from "react-markdown";
import { articleMarkdownComponents, articleMarkdownRehypePlugins } from "@/lib/article-markdown";

const proseClasses = `
  prose prose-invert max-w-none
  prose-headings:font-semibold prose-headings:tracking-tight
  prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4
  prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
  prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
  prose-p:my-4 prose-p:leading-relaxed
  prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
  prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
  prose-li:my-1
  prose-strong:font-semibold prose-strong:text-foreground
  prose-hr:border-border prose-hr:my-8
  prose-blockquote:border-l-accent prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted
  prose-a:text-accent prose-a:no-underline prose-a:hover:underline
`;

export function ArticleBody({ content }: { content: string }) {
  return (
    <div className={proseClasses}>
      <ReactMarkdown rehypePlugins={articleMarkdownRehypePlugins} components={articleMarkdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
