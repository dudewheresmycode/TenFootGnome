## Development Notes

PRs and contributions are welcome! Here's a rough guide on getting started.

### Setting up the dev environment

Clone this repo

```bash
git clone https://github.com/dudewheresmycode/TenFootGnome.git
cd TenFootGnome
```

Compile the schemas. The schemas outline key value pairs for storing extension preferences. You'll need to do this anytime you make changes to the raw schema xml.

```bash
glib-compile-schemas ./extension/schemas/
```

You can create a link to the `extension` folder of this project in the `~/.local/share/gnome-shell/extensions` directory.

```bash
# make sure the extensions directory exists
mkdir -p ~/.local/share/gnome-shell/extensions
# add a symlink
ln ./extension ~/.local/share/gnome-shell/extensions/tenfootgnome@dudewheresmycode.github.io
```

Restart gnome-shell by pressing `Alt` + `F2` and then type `restart` and press enter

Enable the extension:

```bash
gnome-extensions enable tenfootgnome@dudewheresmycode.github.io
```

### Useful Commands

Get live debug logs:

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

```bash
# force restart gnome-shell
killall -3 gnome-shell
```

### Resources

- https://gjs.guide/extensions/development/creating.html
- https://gjs-docs.gnome.org/
