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

Per default, it comes with a button to show and hide the UI. But you can show or hide the picker 'manually' too. I should probably add an option like button=false :

    myPicker.show();  // Show the picker
    myPicker.hide();  // Hide the picker

Per default, the tabs sport the name of the folder the icons are from. But you can set a custom name or an image or unicode icon for each category:

    myPicker.setFolderIcon('folderName', 'iconName');

You can also set the order of the tabs. These are the original names, not the ones you set with the function above:

    myPicker.setTabOrder(['category1', 'category2', 'category3']);

And finally, you can destroy the picker when you're done with it:

    myPicker.destroy();

## License

This project is licensed under the MIT License.
