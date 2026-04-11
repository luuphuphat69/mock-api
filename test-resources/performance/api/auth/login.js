import http from 'k6/http';
import { check, sleep } from 'k6';

export default function testLogin(user, password) {

    const payload = JSON.stringify({
        "email": user,
        "password": password
    });

    const res = http.post('https://mockapi.io.vn/api/login',
        payload,
        {
            headers: { 
                'Content-Type': 'application/json', 
            }
        },
        { tags: '[AUTH] login' }
    );

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 3000ms': (r) => r.timings.duration < 3000,
    });
}