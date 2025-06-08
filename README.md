# RS - Run Scripts CLI

RS was created to address my frustration with working in multiple projects that use different package managers and have various scripts defined, and to provide a simple and intuitive way to list and execute npm scripts without having to remember the exact syntax or navigate through a project's configuration.

1. **Package Manager Agnostic**: RS automatically detects whether your project uses npm, yarn, pnpm, or bun, eliminating the need to remember or switch between different commands.

2. **Quick Script Discovery**: Use `rs` or `rs -l` to instantly view all scripts, eliminating the need to search through `package.json`.

3. **Simplified Execution**: Run any script with a simple `rs <script-name>` command, without needing to prefix it with `npm run`, `yarn`, or other package manager-specific commands.

4. **Global Scripts**: RS allows you to define and run global scripts that are not defined in your project's `package.json`, making it easy to reuse common scripts across multiple projects.

5. **Directory Scripts**: RS supports directory-specific scripts that are tied to the current working directory, perfect for projects without a `package.json` or for custom build scripts you don't want to clutter your global scripts with.

## Features

- Automatically detects the package manager used in your project (npm, yarn, pnpm, or bun)
- Lists all available scripts from your `package.json`
- Supports global scripts that work across all projects
- Supports directory-specific scripts tied to the current working directory
- Interactive mode for easy script selection
- Runs scripts with a simple command

## Installation

You can use RS in two ways: by installing it globally or by using it with npx.

### Global Installation

To install RS globally, use the following command:

```bash
npm install -g rs-runner
```

### Using npx

You can also use RS without installing it globally by using npx:

```bash
npx rs-runner <script>
```

Replace `<script>` with the name of the script you want to run.

## Usage

### Listing Scripts

To list all available scripts in your project, use the following command:

```bash
rs
```

or

```bash
rs -l
```

This will display a list of all scripts defined in your `package.json` file, directory scripts for the current path, and global scripts.

### Running a Script

To run a specific script, use the following command:

```bash
rs <script>
```

Replace `<script>` with the name of the script you want to run. RS will check for scripts in this order:
1. Package.json scripts
2. Directory scripts (current directory)
3. Global scripts
4. Package manager commands

### Interactive Mode

For an interactive script selection experience, use:

```bash
rs -i
```

This will present you with a list of all available scripts organized by type (package, directory, global) that you can select from.

### Global Scripts

RS supports running global scripts that are not defined in your local `package.json`. 
This is particularly useful for running scripts that you use across multiple projects.

#### Add Global Scripts

To add a global script, use the following command:

```bash
rs -a <key> <value>
```

For example:

```bash
rs -a hello "echo hello world"
```

This will add a global script named "hello" that echoes "hello world" when run.

#### Delete Global Scripts

To delete a global script, use the following command:

```bash
rs -d <key>
```

For example:

```bash
rs -d hello
```

### Directory Scripts

Directory scripts are perfect for situations where you want to run something specific to the current directory but don't have a `package.json` or don't want to clutter your global scripts.

#### Add Directory Scripts

To add a directory script, use the following command:

```bash
rs --add-dir <key> <value>
```

For example:

```bash
rs --add-dir build "gcc -o main main.c"
```

This will add a directory script named "build" that compiles a C program, but only for the current directory.

#### Delete Directory Scripts

To delete a directory script, use the following command:

```bash
rs --delete-dir <key>
```

For example:

```bash
rs --delete-dir build
```

### Run any package manager command with rs

You can run any package manager command with rs by using the following command (as long as it's not a script defined in the package.json, directory scripts, or globally):

```bash
rs <command>
```

For example:

```bash
rs install
rs
rs add lodash
rs dev
```

If you need to run a package manager command that includes options (e.g., commands with dashes), encapsulate the entire command in quotes:

```bash
rs "install --save-dev typescript"
```

## Script Priority

RS checks for scripts in the following order:

1. **Package.json scripts** - Scripts defined in your project's `package.json`
2. **Directory scripts** - Scripts specific to the current working directory
3. **Global scripts** - Scripts available across all projects
4. **Package manager commands** - Direct package manager commands (install, add, etc.)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributing

If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## Support

If you need help or have questions, please open an issue on the GitHub repository.