import React, { FC } from "react";
import ReactMarkdown from "react-markdown";
// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import atomDark from "react-syntax-highlighter/dist/cjs/styles/prism/atom-dark";
import styles from "../styles/MdWithCode.module.css";

type ComponentProps = {
  content: string;
};

export const MdWithCode: FC<ComponentProps> = (props) => {
  let markdown = props.content;
  return (
    // haven't even read the code below
    // copied form react-markdown readme
    // (https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight)
    // hate it
    <div className={styles.mdBlock}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={atomDark}
                showLineNumbers={
                  String(children).split(/\r\n|\r|\n/).length > 3
                }
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export const MemoizedMdWithCode = React.memo(MdWithCode);
