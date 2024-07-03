# Claude-ChatHistory-Downloader

This JavaScript code snippet allows you to download the chat history from a Claude chat as a Markdown file. It parses the chat history on the page, converts it to Markdown format, and then triggers a download of the Markdown file.

## 日本語はこちら
https://github.com/rascal-3/Claude-Chat-History-Downloader/blob/main/README(%E6%97%A5%E6%9C%AC%E8%AA%9E).md

## Features

- Converts chat history from Claude chat to Markdown format.
- Supports various HTML elements including paragraphs, ordered lists, unordered lists, code blocks, and tables.
- Automatically downloads the converted chat history as a Markdown file.
- Runs entirely in the user's browser, ensuring privacy and security.

## How to Use

1. Open your web browser's Developer Tools.
2. Navigate to the "Console" tab.
3. Copy and paste the entire script below into the console.
4. Press Enter to execute the script.
5. A Markdown file named `chat_log.md` will be automatically downloaded.

## Code

```javascript
(() => {
    const downloadMarkdownFile = (filename, content) => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const parseElementToMarkdown = (element) => {
        let markdown = '';
        const childNodes = element.childNodes;

        childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                markdown += node.textContent;
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                switch (node.tagName) {
                    case 'P':
                        markdown += node.textContent + '\n\n';
                        break;
                    case 'OL':
                        node.childNodes.forEach((li, index) => {
                            if (li.tagName === 'LI') {
                                markdown += `${index + 1}. ${li.textContent}\n`;
                            }
                        });
                        markdown += '\n';
                        break;
                    case 'UL':
                        node.childNodes.forEach((li) => {
                            if (li.tagName === 'LI') {
                                markdown += `- ${li.textContent}\n`;
                            }
                        });
                        markdown += '\n';
                        break;
                    case 'PRE':
                    case 'DIV':
                        if (node.classList.contains('code-block__code')) {
                            const codeNode = Array.from(node.childNodes).find(child => child.tagName === 'CODE');
                            if (codeNode) {
                                const languageClass = codeNode.className || '';
                                const language = languageClass.replace('language-', '');
                                const codeContent = codeNode.textContent.trim();
                                markdown += `\`\`\`${language}\n${codeContent}\n\`\`\`\n`;
                            }
                        } else {
                            markdown += parseElementToMarkdown(node);
                        }
                        break;
                    case 'TABLE':
                        let tableMarkdown = '';
                        node.childNodes.forEach((child) => {
                            if (child.tagName === 'THEAD' || child.tagName === 'TBODY') {
                                let rowContent = '';
                                let colCount = 0;
                                child.childNodes.forEach((row) => {
                                    if (row.tagName === 'TR') {
                                        let cellContent = '';
                                        row.childNodes.forEach((cell) => {
                                            if (cell.tagName === 'TD' || cell.tagName === 'TH') {
                                                cellContent += `| ${cell.textContent} `;
                                                if (child.tagName === 'THEAD') colCount++;
                                            }
                                        });
                                        rowContent += `${cellContent}|\n`;
                                    }
                                });
                                tableMarkdown += rowContent;
                                if (child.tagName === 'THEAD') {
                                    const headerSeparator = `|${" --- |".repeat(colCount)}`;
                                    tableMarkdown += headerSeparator + '\n';
                                }
                            }
                        });
                        markdown += tableMarkdown + '\n';
                        break;
                    default:
                        markdown += node.textContent;
                        break;
                }
            }
        });
        return markdown;
    };

    const elements = document.querySelectorAll("div.font-claude-message, div.font-user-message");
    let markdown = '';

    elements.forEach((element) => {
        const messageType = element.classList.contains('font-claude-message') ? '_Claude_:\n' : '_Prompt_:\n';
        markdown += messageType + parseElementToMarkdown(element) + '\n\n';
    });

    markdown = markdown.replace(/\S+Copy```/g, '```');
    downloadMarkdownFile('chat_log.md', markdown);
})();
```

## Privacy and Security

This script runs entirely within your browser and does not send any data to external servers. Your chat history remains private and secure on your local machine.

## Disclaimer

Use this script at your own risk. The author is not responsible for any data loss or damage that may occur from using this script.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
