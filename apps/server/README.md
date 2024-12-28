# ImageMagick Installation and Removal Guide

This guide provides instructions for installing and removing ImageMagick on both Linux and Windows systems.

---

## Linux Installation and Removal

### Install ImageMagick

Run the following commands in your terminal:

```bash
sudo apt update
sudo apt install -y imagemagick
```

### Permanently Remove ImageMagick

To remove ImageMagick along with its configuration files:

```bash
sudo apt remove --purge -y imagemagick
sudo apt autoremove -y
sudo apt clean
```

---

## Windows Installation and Removal

### Using Chocolatey (Recommended)

#### Install ImageMagick

1. Ensure Chocolatey is installed. If not, install it from [https://chocolatey.org/install](https://chocolatey.org/install).
2. Open **Command Prompt** or **PowerShell** as Administrator and run:

   ```bash
   choco install imagemagick
   ```

#### Remove ImageMagick

To uninstall ImageMagick:

```bash
choco uninstall imagemagick
```

### Using Scoop (Alternative)

#### Install ImageMagick

1. Ensure Scoop is installed. If not, install it using:

   ```bash
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

2. Install ImageMagick with Scoop:

   ```bash
   scoop install imagemagick
   ```

#### Remove ImageMagick

To uninstall ImageMagick:

```bash
scoop uninstall imagemagick
```

---

## Verify Installation

After installing ImageMagick, verify the installation by checking the version:

```bash
magick --version
```

---

## Additional Notes

- Ensure you have administrative privileges for installations/removals on Windows.
- For Linux, the commands are tested on **Debian-based distributions** (like Ubuntu). Use appropriate package managers for other distros (e.g., `yum` for RHEL-based distros).
