# TenFoot

TenFoot is a gnome extension that displays a [10-foot](https://en.wikipedia.org/wiki/10-foot_user_interface) interface. It makes it easy to browse and launch apps with your keyboard or multi-media remote.

---

## Optional Tweaks for HTPCs

If you use your computer primarily as an HTPC, there are also a few manual tweaks that you can do to make your gnome more HTPC friendly.

#### Disable Dock (Ubuntu)

```bash
gnome-extensions disable ubuntu-dock@ubuntu.com
# to re-enable:
gnome-extensions enable ubuntu-dock@ubuntu.com
```

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

---

## Extension Development

1. Clone this repo

```bash
git clone https://github.com/dudewheresmycode/TenFootGnome.git
cd TenFootGnome
```

2. Then create a link the extensions folder of this project to the `~/.local/share/gnome-shell/extensions` directory.

```bash
# make sure the extensions directory exists
mkdir -p ~/.local/share/gnome-shell/extensions
# add the symlink
ln ./extension ~/.local/share/gnome-shell/extensions/tenfootgnome@dudewheresmycode.github.io
```

3. Enable extension:

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
