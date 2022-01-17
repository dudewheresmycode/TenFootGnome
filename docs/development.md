## Development Notes

To get started:

1. Clone this repo

```bash
git clone https://github.com/dudewheresmycode/TenFootGnome.git
cd TenFootGnome
```

2. Compile the schema

```bash
glib-compile-schemas ./extension/schemas/
```

3. Then create a link the `extensions` folder of this project to the `~/.local/share/gnome-shell/extensions` directory.

```bash
# make sure the extensions directory exists
mkdir -p ~/.local/share/gnome-shell/extensions
# add a symlink
ln ./extension ~/.local/share/gnome-shell/extensions/tenfootgnome@dudewheresmycode.github.io
```

4. Restart gnome-shell by pressing `Alt` + `F2` and then type `restart` and press enter

5. Enable extension:

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
