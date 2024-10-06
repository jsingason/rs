# RS - Run Scripts CLI

## Why RS?

I'm sure there are other tools that do this, but I wanted to make one that is bare bones and easy to use.

RS was created to address my frustration with working in multiple projects that use different package managers and have various scripts defined, and to provide a simple and intuitive way to list and execute npm scripts without having to remember the exact syntax or navigate through your project's configuration.

1. **Package Manager Agnostic**: RS automatically detects whether your project uses npm, yarn, pnpm, or bun, eliminating the need to remember or switch between different commands.

2. **Quick Script Discovery**: Use `-l` to instantly view all scripts, eliminating the need to search through `package.json`.

3. **Simplified Execution**: Run any script with a simple `rs <script-name>` command, without needing to prefix it with `npm run`, `yarn`, or other package manager-specific commands.

## Features

- Automatically detects the package manager used in your project (npm, yarn, pnpm, or bun)
- Lists all available scripts from your `package.json`
- Runs scripts with a simple command

## Installation

You can use RS in two ways: by installing it globally or by using it with npx.

### Global Installation

To install RS globally, use the following command:

```bash
npm install -g rs
```

### Using npx

You can also use RS without installing it globally by using npx:

```bash
npx rs <script>
```

Replace `<script>` with the name of the script you want to run.

## Usage

### Listing Scripts


To list all available scripts in your project, use the following command:

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

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Contributing

We welcome contributions to RS! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## Support

If you need help or have questions, please open an issue on the GitHub repository.