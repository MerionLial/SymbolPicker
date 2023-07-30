# SymbolPicker
SymbolPicker is a JavaScript class that creates an intuitive emoji-picker-like user interface for selecting PNG icons. The class creates a user interface which includes a preview area where the chosen icon is displayed, a selection grid for browsing icons, and a button to open the picker.
## Features

* UI for easy browsing and picking of icons
* Create and destroy instances on-the-go
* Load and categorize symbols dynamically
* Set unique icons for each category folder
* Arrange the order of the tabs

# Usage

Simply create a new SymbolPicker with:

    let myPicker = new SymbolPicker('elementId', 'path/to/symbol/files');

Here is what each parameter is for:

    elementId - The id of the element to which the picker is attached.
    symbolFilePath - The path of the symbol files.
    options - An object that can contain the following:
        seedSymbol - The name of the symbol that should be pre-selected.
        apiURL - The API url to get the symbols.
        urlParams - Parameters to send to the API.

You can show or hide the picker:

    myPicker.show();  // Show the picker
    myPicker.hide();  // Hide the picker

You can set the icon for each category folder:

    myPicker.setFolderIcon('folderName', 'iconName');

You can also set the order of the tabs:

    myPicker.setTabOrder(['category1', 'category2', 'category3']);

And finally, you can destroy the picker when you're done with it:

    myPicker.destroy();

## License

This project is licensed under the MIT License.
