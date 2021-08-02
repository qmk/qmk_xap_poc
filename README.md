# Quantum Mechanical Keyboard XAP Client

[![Build/release](https://github.com/qmk/qmk_xap/actions/workflows/build.yml/badge.svg)](https://github.com/qmk/qmk_xap/actions/workflows/build.yml)
[![Discord](https://img.shields.io/discord/440868230475677696.svg)](https://discord.gg/Uq7gcHh)
[![GitHub contributors](https://img.shields.io/github/contributors/qmk/qmk_xap.svg)](https://github.com/qmk/qmk_xap/pulse/monthly)
[![GitHub forks](https://img.shields.io/github/forks/qmk/qmk_xap.svg?style=social&label=Fork)](https://github.com/qmk/qmk_xap/)

The QMK XAP Client is a tool used for reconfiguring a XAP-enabled keyboard running [QMK Firmware](https://github.com/qmk/qmk_firmware).

Releases can be found on the [releases page](https://github.com/qmk/qmk_xap/releases).

This project is an extremely early work in progress. To begin contributing, please head to [Discord](https://discord.gg/Uq7gcHh) and head to #qmk_firmware.

## Development

We recommend you install and use [NVM](https://github.com/creationix/nvm) to manage node versions. There is a .nvmrc file in the root of the project directory that has been tested with our dependencies.

### Select node version
```shell
# macOS/Linux
nvm use
```

Unfortunately Windows' version of `nvm` does not act the same way as the macOS/Linux version -- it attempts to mirror the Unix-based version but has its own nuances. It is not compatible with the `.nvmrc` file's use of the _LTS_ version, and needs an explicit version to be specified instead -- see below.

Additionally, globally installing _nodejs_ on your system will override the use of `nvm` and as such should be uninstalled if at all possible.

```shell
# Windows
nvm on
nvm use 14.17.1
```


### Project setup
```
yarn
```

### Debugging

Using Visual Studio Code + Vetur is strongly recommended, and appropriate launch configurations have already been supplied in the repository to get you up and running!

### Producing Builds
```sh
yarn app:build   # Note: only creates an executable for the current system architecture
```

### GitHub Actions
Pushes to the repository will generate builds through GitHub Actions -- with appropriate access a draft release will automatically be created based on the version in `package.json`.

### Notes

* Linux
    * AppImage execution may fail on systems with an error:
      > The SUID sandbox helper binary was found, but is not configured correctly.

      This can be remedied by executing:
      ```sh
      sudo sysctl kernel.unprivileged_userns_clone=1
      ```
      See [here](https://chromium.googlesource.com/chromium/src/+/master/docs/linux_suid_sandbox_development.md), [here](https://wiki.archlinux.org/index.php/Linux_Containers#Enable_support_to_run_unprivileged_containers_(optional)), [here](https://bugs.launchpad.net/snapd/+bug/1914786), [here](https://github.com/Revolutionary-Games/Thrive/issues/749).

      To permanently make this change, you can run the following:
      ```sh
      # Enable unprivileged user namespaces
      echo 'kernel.unprivileged_userns_clone = 1' | sudo tee /etc/sysctl.d/00-local-userns.conf
      sudo chmod 644 /etc/sysctl.d/00-local-userns.conf
      ```

    * Access to `/dev/hidraw*` may fail due to permissions. If you're using `udev` for managing hotpluggable device permissions, you can set up permanent rules to add access:
      ```sh
      # Add yourself to the `plugdev` group
      sudo usermod -aG plugdev $USER
      newgrp plugdev
      id
      # Add a new udev rule for hidraw device nodes:
      echo 'KERNEL=="hidraw*", SUBSYSTEM=="hidraw", MODE="0664", GROUP="plugdev"' | sudo tee /etc/udev/rules.d/99-hidraw-permissions.rules
      sudo chmod 644 /etc/udev/rules.d/99-hidraw-permissions.rules
      sudo udevadm control --reload-rules && sudo udevadm trigger
      ```