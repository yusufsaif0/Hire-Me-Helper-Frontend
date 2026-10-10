# ADR 0003: Independent module folders

Status: accepted by explicit user instruction.

The user requested all files to be placed where they are used and each module to own its
package.json and node_modules. This supersedes ADRs 0001/0002 and the root workspace layout.

Use six independent npm projects, each with a lockfile, local dependencies and local code.
Copy common contracts/configuration/UI into the modules that use them. Keep documentation
under each project and API specifications under each backend. Place the shared local Docker
configuration in the admin backend, maintaining its Docker project name and persistent volumes.
Remove the root package manager, dependency directory, utility packages and tooling files
after all module installations and checks succeed. No runtime source imports may cross modules.

Tradeoff: common code is duplicated. Future contract changes must update the relevant modules
and their tests together. Each module can be copied elsewhere, installed and run independently.
