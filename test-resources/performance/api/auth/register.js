import http from 'k6/http';
import { check, sleep } from 'k6';

export default function testRegister() {
    const res = http.post('https://api.mockapi.io.vn/api/register', {
        "email": 'testuser1@gmail.com',
        "name": 'testuser1',
        "password": '1234'
    });

    if(res.status !== 201)
        console.log(`[AUTH] register: failed with status ${res.status}, duration: ${res.timings.duration}`)

    check(res, {
        'status is 201': (r) => r.status === 200,
        'response time < 3000ms': (r) => r.timings.duration < 3000,
    });
}
