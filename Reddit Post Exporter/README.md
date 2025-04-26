# Reddit Post Exporter

A powerful userscript that allows you to export Reddit posts in multiple formats with a clean, intuitive interface.

## Features

- **Multiple Export Formats**:
  - Markdown (.md)
  - Plain Text (.txt)
  - HTML (.html)
  - PDF (.pdf)

- **Copy to Clipboard**:
  - Quickly copy post content in Markdown, Plain Text, or HTML format

- **Clean UI**:
  - Minimalist dropdown interface that matches Reddit's design
  - Automatic dark/light mode detection
  - Non-intrusive placement

- **Enhanced Content Processing**:
  - Preserves formatting, links, and code blocks
  - Converts relative URLs to absolute URLs
  - Properly formats code blocks with language detection
  - Maintains image references

- **Multi-page PDF Support**:
  - Automatically paginates long posts
  - Adds headers and footers to each page
  - Preserves formatting in PDF exports

## Installation

1. Make sure you have a userscript manager installed:
   - [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - [Tampermonkey for Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)

2. Install the script:
   - [Click here to install](https://github.com/0V3RR1DE0/Userscripts/raw/refs/heads/main/Reddit%20Post%20Exporter/reddit-post-exporter.user.js)
   - Or navigate to the script file in this repository and click "Raw"

## Usage

1. Navigate to any Reddit post
2. Look for the "Export" button in the top-right corner of the page
3. Click the button to reveal export options
4. Choose your preferred export format:
   - **Copy**: Instantly copy the post content to your clipboard
   - **Download**: Save the post as a file in your chosen format

## Compatibility

- Works with both old and new Reddit designs
- Tested on Chrome, Firefox, and Edge
- Compatible with most Reddit post types (text, images, links)

## Technical Details

The script uses:
- TurndownJS for HTML to Markdown conversion
- jsPDF for PDF generation
- Native browser APIs for file downloads and clipboard operations

## Limitations

- Does not export comments (only the main post)
- Video content is referenced but not embedded in exports
- Some complex Reddit formatting may not be perfectly preserved

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Acknowledgments

- [TurndownJS](https://github.com/domchristie/turndown) for HTML to Markdown conversion
- [jsPDF](https://github.com/parallax/jsPDF) for PDF generation

---

[Return to Userscripts Collection](../)
