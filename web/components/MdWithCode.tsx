import React, { FC } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import atomDark from "react-syntax-highlighter/dist/cjs/styles/prism/atom-dark";
import styles from "../styles/MdWithCode.module.css";

type ComponentProps = {
  content: string;
};

const MdWithCode: FC<ComponentProps> = (props) => {
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

export default MdWithCode;
