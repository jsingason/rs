# RS - Run Scripts CLI

RS was created to address my frustration with working in multiple projects that use different package managers and have various scripts defined, and to provide a simple and intuitive way to list and execute npm scripts without having to remember the exact syntax or navigate through a project's configuration.

1. **Package Manager Agnostic**: RS automatically detects whether your project uses npm, yarn, pnpm, or bun, eliminating the need to remember or switch between different commands.

2. **Quick Script Discovery**: Use `rs` or `rs -l` to instantly view all scripts, eliminating the need to search through `package.json`.

3. **Simplified Execution**: Run any script with a simple `rs <script-name>` command, without needing to prefix it with `npm run`, `yarn`, or other package manager-specific commands.

4. **Global Scripts**: RS allows you to define and run global scripts that are not defined in your project's `package.json`, making it easy to reuse common scripts across multiple projects.

## Features

- Automatically detects the package manager used in your project (npm, yarn, pnpm, or bun)
- Lists all available scripts from your `package.json`
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

```bash
rs -l
```

This will display a list of all scripts defined in your `package.json` file.

### Running a Script

To run a specific script, use the following command:

```bash
rs <script>
```

Replace `<script>` with the name of the script you want to run.


### Add Global Scripts

RS also supports running global scripts that are not defined in your local `package.json`. 
This is particularly useful for running scripts that you use across multiple projects.

To run a global script, use the following command:

```bash
`rs -a <key> <value>`
```

For example:

```bash
`rs -a hello "echo hello world"`
```

### Delete Global Scripts

To delete a global script, use the following command:

```bash
`rs -d <key>`
```

For example:

```bash
`rs -d hello`
```

### Run any package manager command with rs

You can run any package manager command with rs by using the following command (as long as its not a script defined in the package.json or globally):

```bash
`rs <command>`
```

This will add a global script named "hello" that echoes "hello world" when run.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributing

If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## Support

If you need help or have questions, please open an issue on the GitHub repository.
