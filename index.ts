import "@logseq/libs";
import Mercury from "@postlight/parser";
import { NodeHtmlMarkdown, NodeHtmlMarkdownOptions } from "node-html-markdown";

import { splitBlock } from "./splitblock";


const regexRules =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s)]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s)]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s)]{2,}|www\.[a-zA-Z0-9]+\.[^\s)]{2,})/gi;

const parseBlock = async (e, isSplit) => {
  const block = await logseq.Editor.getBlock(e.uuid);
  block?.content?.match(regexRules)?.forEach((url) => {
    console.log('Parsing: ', url);
    Mercury.parse(url, { contentType: "html" }).then((result) => {
      if (isSplit) {
        logseq.Editor.insertBatchBlock(
          e.uuid,
          splitBlock(NodeHtmlMarkdown.translate(result.content)),
          { sibling: false }
        );
      } else {
        logseq.Editor.insertBlock(
          e.uuid,
          NodeHtmlMarkdown.translate(result.content),
          { sibling: false }
        );
      }
    });
  });
};

const main = async () => {
  console.log("plugin loaded");

  // logseq.Editor.registerBlockContextMenuItem("Parse URL", async (e) => {
  //   parseBlock(e, true);
  // });
  // logseq.Editor.registerSlashCommand("Parse URL", async (e) => {
  //   parseBlock(e, true);
  // });
  logseq.App.registerCommandPalette({
        key: 'parse-urls',
        label: "Fetch content from URLs",
    }, async (e) => {
      let blocks = await logseq.Editor.getSelectedBlocks()
      if (!blocks)
          blocks = [
            (await logseq.Editor.getCurrentBlock())!
          ]

      for (const block of blocks)
        await parseBlock(block, true)
    }
  )

  // logseq.Editor.registerBlockContextMenuItem("Parse URL into single block", async (e) => {
  //   parseBlock(e, false);
  // });
  // logseq.Editor.registerSlashCommand("Parse URL into Single Block", async (e) => {
  //   parseBlock(e, false);
  // });
};

logseq.ready(main).catch(console.error);
