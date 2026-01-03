// Quick script to check if environment variables are set
import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 Environment Variables Check:\n');

const required = [
    'SMTP_HOST',
    'SMTP_PORT', 
    'SMTP_USER',
    'SMTP_PASSWORD',
    'KAFKA_BROKER',
    'KAFKA_USERNAME',
    'KAFKA_PASSWORD'
];

let allSet = true;

required.forEach(key => {
    const value = process.env[key];
    if (value) {
        // Mask passwords
        const display = key.includes('PASSWORD') 
            ? `${value.substring(0, 3)}***${value.substring(value.length - 3)}`
            : value;
        console.log(`✅ ${key}: ${display}`);
    } else {
        console.log(`❌ ${key}: NOT SET`);
        allSet = false;
    }
});

console.log('\n' + (allSet ? '✅ All required variables are set!' : '❌ Some variables are missing!') + '\n');
