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

Mapping keys

```bash
xmodmap -e 'add Control = Escape'
```

```bash
showkey -a

Press any keys - Ctrl-D will terminate this program

a    97 0141 0x61
b    98 0142 0x62
c    99 0143 0x63
d   100 0144 0x64
e   101 0145 0x65
f   102 0146 0x66
g   103 0147 0x67
```

### Resources

- https://gjs.guide/extensions/development/creating.html
- https://gjs-docs.gnome.org/

### VirtualBox Development

Some notes on using VirtualBox to run Ubuntu for development.

#### Port-forwarding for SSH

- Open virtual box container settings
- Go to Network > Advanced > Port Forwarding
- Add a new rule for SSH:

| Name | Protocol | Host IP | Host Port | Guest IP | Guest Port |
| ---- | -------- | ------- | --------- | -------- | ---------- |
| ssh  | TCP      |         | 3232      |          | 22         |

- Then you should be able to ssh into the container with `ssh -p 3232 user@127.0.0.1`

> Note: You may also need to install `openssh-server` on a fresh Ubuntu container: (`sudo apt install openssh-server`)

---

#### Add 1920x1080 display resolution:

Add or edit `/usr/share/X11/xorg.conf.d/10-monitor.conf` and add the following:

```
Section "Monitor"
    Identifier "Virtual1"
    Modeline "p1920x1080"  173.00  1920 2048 2248 2576  1080 1083 1088 1120 -hsync +vsync
    Option "PreferredMode" "p1920x1080"
EndSection
```

then reboot Ubuntu and open `Settings > Display` and you should be able to select the new resolution from the list.

https://superuser.com/questions/758463/getting-1920x1080-resolution-or-169-aspect-ratio-on-ubuntu-or-linux-mint
