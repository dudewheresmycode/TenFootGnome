# TenFoot

TenFoot is a [10-foot](https://en.wikipedia.org/wiki/10-foot_user_interface) interface extension for gnome based linux. It makes it easy to browse and launch apps with your keyboard or multi-media remote.

If you use your computer primarily as an HTPC, there are also a few manual tweaks that you can do to make your gnome more HTPC friendly.

### Setting Up the Desktop environment for HTPC

Configure auto-login, edit `/etc/gdm3/custom.conf` and configure like so:

```
[daemon]
AutomaticLoginEnable=True
AutomaticLogin=YOUR_USERNAME
```

Some optional optimizations for making HTPC "always on"

```bash
# Disable lock screen
gsettings set org.gnome.desktop.lockdown disable-lock-screen true
gsettings set org.gnome.desktop.screensaver lock-enabled false
gsettings set org.gnome.desktop.screensaver ubuntu-lock-on-suspend false
# disable screen blanking
gsettings set org.gnome.desktop.session idle-delay 0

# misc
# gsettings set org.gnome.desktop.background primary-color '#282A2D'
# gsettings set org.gnome.desktop.interface clock-show-date false
# gsettings set org.gnome.desktop.interface gtk-theme 'PlexHTPC'
# enable automatic-login

```

### Extension Development

Add the extensions folder of this project to: `~/.local/share/gnome-shell/extensions/nuecaster@gmail.com`

Enable extension:

```bash
gnome-extensions enable nuecaster@gmail.com
```

Get the debug logs:

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

Source: https://gjs.guide/extensions/development/creating.html

Useful commands:

```bash
# force restart gnome-shell
killall -3 gnome-shell
```
