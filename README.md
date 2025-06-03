

## Installation

1. Make sure you have [Node.js](https://nodejs.org/) installed
2. Install dependencies:

```bash
npm install
```

## Usage

Run the script with an optional directory path:

```bash
# Search in current directory
node src/find_images.js

# Search in a specific directory
node src/find_images.js /path/to/search/directory
```

## Output

The script generates the following files:

1. `image_files.csv` - CSV file with image information
2. `image_gallery.html` - HTML table with image previews
3. `images/` directory - Contains local copies of all found images

## Configuration

You can modify the following constants in the script:

- `IMAGE_EXTENSIONS` - Array of file extensions to search for
- `IGNORE_DIRS` - Array of directories to ignore
- Edit the `main()` function to change file paths and names

## Example Output

### HTML Table

The HTML table includes:

- Filename
- Image preview
- Relative path to the original file

### CSV Format

The CSV file includes columns for:

- filename
- relative_path
- full_path

## License

MIT
