# TenFootGnome

TenFootGnome is a [gnome extension](https://extensions.gnome.org/) that displays a [10-foot](https://en.wikipedia.org/wiki/10-foot_user_interface) interface. It makes it easy to browse and launch apps with your keyboard or multi-media remote.

---

## User Guide

### Getting Started

Coming soon to https://extensions.gnome.org, for now you'll have to install via the [Extension Development](#Extension-Development) guide.

### Panel Menu

<img src="https://user-images.githubusercontent.com/3523761/149646804-d8f4c99f-6d19-418b-b88e-99e4a3165ec7.png" height="200" />

After the extension is installed, you'll notice a new panel menu at the top of the screen.

- `Help` - Clicking this will open the project's help page.

- `Show on Startup` - Toggling this will launch into the 10-foot interface upon startup.

- `Open Interface` - This will launch into the 10-foot interface.

---

## 10-foot Interface

### Controls

- `↑` / `↓` / `→` / `←`: Arrow keys navigate the home screen.
- `Enter` / `Space`: Selects focused item
- `Q`: Exit the 10-foot interface

### Managing Applications

The main grid view will show the applications in your favorites list in a grid.

To manage your favorites:

1. Exit the 10-foot interface (press `Q`), and go to your main applications list.
1. Right-click on the application you want to add and select Add to Favorites, or Remove from Favorites.
1. Reopen the 10-foot interface and you should see your customized apps in the grid. See [this guide](https://help.ubuntu.com/stable/ubuntu-help/shell-apps-favorites.html.en) for more information.

---

## Optional Tweaks for HTPCs

If you use your computer primarily as an HTPC, there are also a few manual tweaks that you can do to make your gnome more HTPC friendly.

#### Automatic Login

To configure auto-login, edit `/etc/gdm3/custom.conf` and configure like so:

```
[daemon]
AutomaticLoginEnable=True
AutomaticLogin=YOUR_USERNAME
```

#### Disable Screen Locking and Blanking

Some optional optimizations for making HTPC's screen "always on".

```bash
# Disable lock screen
gsettings set org.gnome.desktop.lockdown disable-lock-screen true
gsettings set org.gnome.desktop.screensaver lock-enabled false
gsettings set org.gnome.desktop.screensaver ubuntu-lock-on-suspend false
# disable screen blanking
gsettings set org.gnome.desktop.session idle-delay 0
```

#### Disable Dock (Ubuntu)

```bash
gnome-extensions disable ubuntu-dock@ubuntu.com
# to re-enable:
gnome-extensions enable ubuntu-dock@ubuntu.com
```

---

## Extension Development

1. Clone this repo

```bash
git clone https://github.com/dudewheresmycode/TenFootGnome.git
cd TenFootGnome
```

2. Compile the schema

```bash
glib-compile-schemas ./extension/schemas/
```

3. Then create a link the extensions folder of this project to the `~/.local/share/gnome-shell/extensions` directory.

```bash
# make sure the extensions directory exists
mkdir -p ~/.local/share/gnome-shell/extensions
# add the symlink
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
