import { Query } from 'node-appwrite';

console.log('Query.equal:', Query.equal('email', 'gollapallisupreeth@gmail.com'));
console.log('Query.orderDesc:', Query.orderDesc('createdAt'));
console.log('Query.limit:', Query.limit(1));
console.log('Query.equal array:', Query.equal('email', ['val1', 'val2']));
console.log('Query.equal boolean:', Query.equal('verified', true));
console.log('Query.equal integer:', Query.equal('attempts', 0));
