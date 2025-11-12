const cleanInput = (value) =>
  typeof value === 'string' ? value.trim() : ''

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanInput(email))

module.exports = {
    cleanInput,
    isValidEmail
};