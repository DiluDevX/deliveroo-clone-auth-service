# [1.0.0-beta.16](https://github.com/DiluDevX/deliveroo-clone-auth-service/compare/v1.0.0-beta.15...v1.0.0-beta.16) (2026-03-05)


### Bug Fixes

* update release workflow and changelog formatting ([3ff5621](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/3ff5621ae4edf29ac683feacd350ce4dbbcdb6c5))

# [1.0.0-beta.15](https://github.com/DiluDevX/deliveroo-clone-auth-service/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2026-03-04)

### Bug Fixes

- disable git push in semantic-release to bypass branch protection ([4d20172](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/4d2017211fec1fbebb5d2eaf8bee744104aa5323))

# [1.0.0-beta.14](https://github.com/DiluDevX/deliveroo-clone-auth-service/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2026-03-04)

### Bug Fixes

- align deploy-ec2.yml with main branch fixes ([5745b6f](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/5745b6f7d38e480e2373068e6b1284617999ecc0))

# [1.0.0-beta.13](https://github.com/DiluDevX/deliveroo-clone-auth-service/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2026-03-04)

### Bug Fixes

- enhance EC2 deployment script with rollback and health check mechanisms ([f1f5e65](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/f1f5e65e2c1cf8a69d82a065532a1590a9356b5c))

# [1.0.0-beta.12](https://github.com/DiluDevX/deliveroo-clone-auth-service/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2026-03-04)

### Bug Fixes

- update EC2 deployment script to use persistent .env file and run migrations ([8f7f8b1](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/8f7f8b1d41a144f652d07cc2e65af2acd0f3acdc))

# [1.0.0-beta.11](https://github.com/DiluDevX/deliveroo-clone-auth-service/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2026-03-04)

### Bug Fixes

- refactor environment variable handling in EC2 deployment script and add debug outputs ([fa8a634](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/fa8a6345bd0d96654acb08c0d2aeece8c368504e))

# [1.0.0-beta.10](https://github.com/DiluDevX/deliveroo-clone-auth-service/compare/v1.0.0-beta.9...v1.0.0-beta.10) (2026-03-04)

### Bug Fixes

- enhance AWS_REGION variable usage and add debug outputs in EC2 deployment script ([e047924](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/e0479243d7656a5d8020e3f8341ab5e09817e04f))

# [1.0.0-beta.9](https://github.com/DiluDevX/deliveroo-clone-auth-service/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2026-03-04)

### Bug Fixes

- update AWS_REGION references to use variable syntax in EC2 deployment script ([963cd33](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/963cd33e7bdba803248e5d0cc8fd4f8c28dccc60))

# [1.0.0-beta.8](https://github.com/DiluDevX/deliveroo-clone-auth-service/compare/v1.0.0-beta.7...v1.0.0-beta.8) (2026-03-04)

### Bug Fixes

- update AWS_REGION reference in EC2 deployment workflow ([5f81c67](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/5f81c673e32600306a239a9ba15da66046c548de))

# [1.0.0-beta.7](https://github.com/DiluDevX/deliveroo-clone-auth-service/compare/v1.0.0-beta.6...v1.0.0-beta.7) (2026-03-04)

### Bug Fixes

- improve error handling logic; enhance request logging and HTML escaping functions ([f4d3ac6](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/f4d3ac624c3be5574ee9ce0457075606742772e3))
- add HUSKY environment variable to Semantic Release step ([2304444](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/2304444c8480eca550501a79758d8da2a94a93bf))
- add shebang and Husky initialization to git hooks ([c1a8d5f](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/c1a8d5f2500c1cc1b27dfc61807d7f22aaa5cef1))
- add step to fix Prettier formatting in release workflow ([da36a4b](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/da36a4b670cbeb142814809c33711a02f88929b5))
- align EXPOSE port with runtime PORT configuration ([78fc662](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/78fc66245a3c3a4289bf17bf491182d69a8b8a80))
- improve entrypoint flexibility and deployment configuration ([194b591](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/194b5913cec4a176cd9f5872c0604ea344d2fd2f))
- improve error handling in user and reset password token services ([6fa2e64](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/6fa2e64b1c0ed2cd6e18b15748664ad83bef2b0d))
- map DEPLOY_ENV to correct Doppler config names (dev/prd) ([5cabe33](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/5cabe33d1a56540ff941beee1fe4d03101eca1e5))
- remove unnecessary blank line in CHANGELOG.md ([988d746](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/988d74667057fa9f4e317a74c2a7671dd183b158))
- remove unnecessary deletedAt checks in user queries and improve user deletion logging ([f6c6bc5](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/f6c6bc508003d97c38e66234993e63ca37ca2b50))
- remove unnecessary options from release workflow steps ([9721597](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/97215971eec85900a170daf2480a6bcf66a11113))
- update README to reflect service features and setup instructions ([6517173](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/6517173af9184b670f61af6179c29f265084522c))
- update SECRET environment variable reference in EC2 deployment workflow ([98e1811](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/98e1811a6a89c1e15a60ee88f5cc46618fabae89))
- use BuildKit secrets instead of build-args for sensitive values ([aaf312a](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/aaf312a502c2f5cbea0edffb24ffcf99bd1a567b))
- use environment variable for service name in health check response ([bbb2f59](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/bbb2f590af9224cc3c2a4841ef7e8566a8221a08))
- validate DEPLOY_ENV values and remove dead code in checkEmail ([b0c922c](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/b0c922cf34416cff82f3771ce69769d9f95b7cb6))

### Features

- add PR quality check workflow and commit message linting ([0912abc](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/0912abc3a59df981666887f3dbb14403e2c38e6d))
- add reset password email template and integrate with email service ([2e8c4bf](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/2e8c4bf2c9c7541291f965dbedb80af20f1f32a7))
- add SECRET environment variable to EC2 deployment workflow ([0b25e83](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/0b25e8311585be68886f3b1873c1dfa9e4cbfd92))
- add step to generate Prisma Client in release workflow ([589acc8](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/589acc86d3b2df1b29d3569d9611ffa91f33a07c))
- configure npm to ignore engine warnings during deployment ([c37cef9](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/c37cef9fc61e1d32fb1f140c915115eac4077667))
- enhance logging and error handling across controllers and services; ([0a4a2af](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/0a4a2af70c746657635796df6f22e6a0c6491f51))
- enhance soft delete functionality with error handling and timestamp; remove unused test module ([fce185e](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/fce185e72dd0774df04767b05dc046e85a45456a))
- enhance user management and email handling; implement rate limiting and security improvements ([3cc3564](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/3cc35640c23cb455350289168b77018ebbd37e16))
- implement cascading soft delete for users and related records; add rate limiter middleware ([d89b4a2](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/d89b4a2448b3a713e570b82d65d5c321a22c8acb))
- implement soft delete for restaurant users and add deletedAt field; update user and auth logic ([20f522c](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/20f522cbef92b7a5c442ebe4fc67bb388ccf7fa1))
- integrate Resend API for email handling and update environment configuration ([b70dc95](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/b70dc950a8ec38cb536984f4b5bae48641e88033))
- refactor authentication and authorization middleware; implement graceful server startup ([5bc10be](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/5bc10bec2b7291d06e6e2e6b7c9e196bacfcb802))
- security measures across services; add HTML escaping utilities ([ad86e7a](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/ad86e7a3fb232f9b3bb1b8d94aa451c02eb60441))
- simplify EC2 deployment workflow ([3fbcdf5](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/3fbcdf5da6c1e1816d8984ac5589928d7f02380c))
- update .env.example to clarify local development settings and remove sensitive information ([03bf786](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/03bf78645d3847869aa2d91ecd7d09696b80e494))
- update deployment workflow to install dependencies and run Prisma migrations ([8516701](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/85167017ec0b3db4cd6266d1de64d93606236bf8))
- update EC2 deployment configuration ([aed153a](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/aed153a5635aec1dd6c9d3373e341687f0a5a8a6))
- update EC2 deployment workflow and database connection handling ([baa7870](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/baa7870e8c08482eae0c37a334255cb8d4f3da67))
- update EC2 deployment workflow and Dockerfile for environment variable handling ([2d29ff1](https://github.com/DiluDevX/deliveroo-clone-auth-service/commit/2d29ff1a7119d87206b745ea7c07a618cddb8fef))

# [1.0.0-beta.6](https://github.com/DiluDevX/deliveroo-auth-service/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2026-02-21)

### Bug Fixes

- install Doppler CLI in the Dockerfile build stage ([702bfe5](https://github.com/DiluDevX/deliveroo-auth-service/commit/702bfe56de7c288fbde1b014653011dbbc2268ed))

# [1.0.0-beta.5](https://github.com/DiluDevX/deliveroo-auth-service/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2026-02-21)

### Bug Fixes

- add DOPPLER_TOKEN as build argument in Dockerfile and CI configuration ([a011d3a](https://github.com/DiluDevX/deliveroo-auth-service/commit/a011d3a745e12554a0159dd9cc39026738aa7b37))

# [1.0.0-beta.4](https://github.com/DiluDevX/deliveroo-auth-service/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2026-02-21)

### Bug Fixes

- add missing DOPPLER_TOKEN environment variable to CI jobs ([f5d8c11](https://github.com/DiluDevX/deliveroo-auth-service/commit/f5d8c1196d881956bc446806ca842445b9cff17b))

# [1.0.0-beta.3](https://github.com/DiluDevX/deliveroo-auth-service/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2026-02-21)

### Bug Fixes

- update Doppler CLI installation command to use sudo ([68b57fa](https://github.com/DiluDevX/deliveroo-auth-service/commit/68b57fa483bc66e6f35e0fcc487d6f065d9c0e02))

# [1.0.0-beta.2](https://github.com/DiluDevX/deliveroo-auth-service/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2026-02-21)

### Features

- add installation step for Doppler CLI in CI workflow ([94839a3](https://github.com/DiluDevX/deliveroo-auth-service/commit/94839a327332bc8862fb550b6345b554f5fa280e))

# 1.0.0-beta.1 (2026-02-21)

### Bug Fixes

- tokens are sent to main api as same site none ([2e9bcf4](https://github.com/DiluDevX/deliveroo-auth-service/commit/2e9bcf4b29dc7e3c8ed4481c1bc5aa5ed88e8be5))

### Features

- add logout functionality and update cookie sameSite attribute to lax ([64f8e86](https://github.com/DiluDevX/deliveroo-auth-service/commit/64f8e863759d5f8f779f9de55a7502e278419b3c))
- add partial user update functionality and corresponding schema validation ([f6af31b](https://github.com/DiluDevX/deliveroo-auth-service/commit/f6af31b13c8ca80bda7ea78c0209bfea7f60c149))
- add refresh token validation and response handling in refreshToken function ([1f8b756](https://github.com/DiluDevX/deliveroo-auth-service/commit/1f8b75680fd757baed226e43be4a1f4c7b153384))
- **auth:** add refresh token generation to refresh endpoint ([13de442](https://github.com/DiluDevX/deliveroo-auth-service/commit/13de44207c394cb9927ced01aed6a13b53035bee))
- **auth:** implement cookie-based authentication with access and refresh tokens ([8d59c62](https://github.com/DiluDevX/deliveroo-auth-service/commit/8d59c6276361d914dac868f1c3465e3793eca5ed))
- **auth:** implement user authentication features including signup, login, password reset, and email verification ([440640a](https://github.com/DiluDevX/deliveroo-auth-service/commit/440640ad4a8a417b298b71326f2984dbbd6eb58f))
- **health:** enhance health check endpoint to include DB status and service version ([f425dab](https://github.com/DiluDevX/deliveroo-auth-service/commit/f425dab550747f24590ce28631e4f0d692bebda6))
- implement admin login functionality and update user roles in the database ([663a4b8](https://github.com/DiluDevX/deliveroo-auth-service/commit/663a4b81b239ce3af9effb8db5eeb1ec123313a1))
- implement restaurant user management with role updates and schema adjustments ([977f411](https://github.com/DiluDevX/deliveroo-auth-service/commit/977f411c78b3d1cd94a5d9cd7a90708ca716b98f))
- **middleware:** add API key authentication middleware ([e63c4f5](https://github.com/DiluDevX/deliveroo-auth-service/commit/e63c4f5d9289895dc559461072c4857d5bd87b59))
- refactor configuration management and remove unused files ([db13d89](https://github.com/DiluDevX/deliveroo-auth-service/commit/db13d8981a37464ecfed517385fd1b23b3e8593d))
- Refactor restaurant user role update service and add email functionality ([1137f56](https://github.com/DiluDevX/deliveroo-auth-service/commit/1137f56e8bff399013089ee945f1339f64882fbc))
- rename microservice and update package.json for deliveroo-auth-service ([3a4d278](https://github.com/DiluDevX/deliveroo-auth-service/commit/3a4d2788300407da0ba2075ca02d7023744cb2fe))
- update Dockerfile for multi-stage builds, enhance entrypoint script, and add semantic release configuration ([d7d302b](https://github.com/DiluDevX/deliveroo-auth-service/commit/d7d302b1b243d635377476bb8e0ba0c68807c5e7))
