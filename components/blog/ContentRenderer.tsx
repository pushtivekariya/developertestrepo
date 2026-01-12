import React from 'react';

// Generic content node type to support flexible JSONB structures
export type ContentNode = {
  tag?: string; // e.g., 'h2' | 'h3' | 'h4' | 'p' | 'ul' | 'ol' | 'li'
  content?: string;
  heading?: string; // some records might use `heading` instead of `content`
  subsections?: ContentNode[];
  items?: Array<ContentNode | string>; // for lists
  href?: string;
  src?: string;
  alt?: string;
  className?: string;
  // Allow additional unknown fields without breaking rendering
  [key: string]: any;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeSections(sections: unknown): ContentNode[] {
  try {
    if (typeof sections === 'string') {
      const parsed = JSON.parse(sections);
      return normalizeSections(parsed);
    }
    if (Array.isArray(sections)) {
      return sections as ContentNode[];
    }
    if (isRecord(sections)) {
      // Some shapes may wrap sections under a key like `sections` or `content`
      if (Array.isArray(sections.sections)) return sections.sections as ContentNode[];
      if (Array.isArray(sections.content)) return sections.content as ContentNode[];
      // Fallback: single node object
      return [sections as ContentNode];
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ContentRenderer] Failed to parse sections', e);
    }
  }
  return [];
}

function Text({ children }: { children?: React.ReactNode }) {
  // Ensure text is rendered safely (no raw HTML injection)
  return <>{children}</>;
}

function renderListItems(items: Array<ContentNode | string> | undefined): React.ReactNode {
  if (!items || items.length === 0) return null;
  return items.map((item, idx) => {
    if (typeof item === 'string') return <li key={idx}><Text>{item}</Text></li>;
    const text = item.content ?? item.heading ?? '';
    return <li key={idx}><Text>{text}</Text></li>;
  });
}

function renderNode(node: ContentNode, index: number): React.ReactNode {
  const tag = (node.tag || '').toLowerCase();
  const text = node.content ?? node.heading ?? '';
  const children = node.subsections?.map((child, idx) => (
    <React.Fragment key={`${index}-${idx}`}>
      {renderNode(child, idx)}
    </React.Fragment>
  ));

  // Handle special content types like policy pages
  if (node.features && Array.isArray(node.features)) {
    return (
      <section key={index} className="my-10">
        <div className="bg-theme-bg/40 rounded-xl shadow-lg p-8">
          {node.heading && (
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">
              {node.heading}
            </h2>
          )}
          <ul className="list-disc ml-6 text-theme-body">
            {node.features.map((item: string, idx: number) => (
              <li key={idx} className="mb-2 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  if (node.faqs && Array.isArray(node.faqs)) {
    return (
      <section key={index} className="my-10">
        <div className="bg-theme-bg/40 rounded-xl shadow-lg p-8">
          {node.heading && (
            <h2 className="text-2xl font-heading font-bold text-primary mb-4">
              {node.heading}
            </h2>
          )}
          <div className="space-y-6">
            {node.faqs.map((faq: any, idx: number) => (
              <div
                key={idx}
                className="border-b border-gray-200 pb-4 last:border-0"
              >
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {faq.question}
                </h3>
                <p className="text-theme-body leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (node.cta) {
    return (
      <div key={index} className="text-center mt-8 mb-8">
        {node.heading && (
          <h3 className="text-xl font-heading font-bold text-primary mb-4">
            {node.heading}
          </h3>
        )}
        <p className="text-theme-body mb-4">{node.cta.text}</p>
        <a
          href="/contact"
          className="text-center align-center items-center"
        >
          <button className="bg-accent hover:bg-accent/80 text-accent-foreground font-bold py-3 px-8 rounded-full text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex justify-center mx-auto">
            {node.cta.button_text}
          </button>
        </a>
      </div>
    );
  }

  switch (tag) {
    case 'h1':
      return <h1 key={index} className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4 mt-8"><Text>{text}</Text></h1>;
    case 'h2':
      return (
        <div key={index} className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-primary mb-4 mt-8">{node.heading || text}</h2>
          {node.content && (
            <div
              className="prose max-w-none text-theme-body leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: node.content }}
            />
          )}
          {children}
        </div>
      );
    case 'h3':
      return (
        <div key={index} className="mb-4">
          <h3 className="text-xl font-heading font-bold text-primary mb-3 mt-6">{node.heading || text}</h3>
          {node.content && (
            <div
              className="prose max-w-none text-theme-body leading-relaxed mb-4"
              dangerouslySetInnerHTML={{ __html: node.content }}
            />
          )}
          {children}
        </div>
      );
    case 'h4':
      return (
        <div key={index} className="mb-3">
          <h4 className="text-lg font-semibold text-primary mb-2 mt-4">{node.heading || text}</h4>
          {node.content && (
            <div
              className="prose max-w-none text-theme-body leading-relaxed"
              dangerouslySetInnerHTML={{ __html: node.content }}
            />
          )}
          {children}
        </div>
      );
    case 'h5':
      return <h5 key={index} className="text-base font-semibold text-primary mb-2 mt-3"><Text>{text}</Text></h5>;
    case 'h6':
      return <h6 key={index} className="text-base font-medium text-primary mb-2 mt-3"><Text>{text}</Text></h6>;
    case 'blockquote':
      return <blockquote key={index} className="border-l-4 border-coral/60 pl-4 italic text-theme-body/80 my-4"><Text>{text}</Text>{children}</blockquote>;
    case 'ul': {
      const items = renderListItems(node.items);
      return <ul key={index} className="list-disc ml-6 text-theme-body mb-4">{items || children}</ul>;
    }
    case 'ol': {
      const items = renderListItems(node.items);
      return <ol key={index} className="list-decimal ml-6 text-theme-body mb-4">{items || children}</ol>;
    }
    case 'li':
      return <li key={index} className="mb-2 leading-relaxed"><Text>{text}</Text>{children}</li>;
    case 'img': {
      // For JSON data that provides images, render a simple img tag. Consumers may replace with next/image if needed.
      const { src, alt = '' } = node;
      if (!src) return null;
      return <img key={index} src={src} alt={alt} className="rounded my-4" />;
    }
    case 'a': {
      const { href = '#' } = node;
      return <a key={index} href={href} className="text-primary hover:underline"><Text>{text}</Text></a>;
    }
    case 'p':
    default:
      // Default to paragraph if tag is missing/unknown
      return <p key={index} className="text-theme-body leading-relaxed mb-4"><Text>{text}</Text>{children}</p>;
  }
}


export default function ContentRenderer({ sections, className = "" }: { sections: unknown; className?: string }) {
  const nodes = normalizeSections(sections);

  if (!nodes.length) return null;

  return (
    <div className={`${className} text-theme-body`}>
      {nodes.map((node, idx) => renderNode(node, idx))}
    </div>
  );
}
