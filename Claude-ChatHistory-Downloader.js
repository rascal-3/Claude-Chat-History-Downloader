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
                                // console.log(`language: ${language}, codeContent: ${codeContent}`);
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

    markdown = markdown.replace(/.*Copy```/g, '```');
    downloadMarkdownFile('chat_log.md', markdown);
})();
