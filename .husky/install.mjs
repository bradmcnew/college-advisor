// Skip Husky installation in production and CI environments
if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') {
  console.log('Skipping Husky installation in production/CI environment')
  process.exit(0)
}

const husky = (await import('husky')).default
console.log(husky())
