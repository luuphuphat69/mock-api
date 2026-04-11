import http from 'k6/http';
import { check, sleep } from 'k6';
import getData from '../../utilities/getdata.js';

const mainUser = getData.userData('main-user')

export function testCreateProject(name, prefix) {
    const payload = JSON.stringify({
        name: name,
        prefix: prefix,
        userId: mainUser.id,
    });
    const res = http.post('https://mockapi.io.vn/api/projects', payload, {
        headers: { 'Content-Type': 'application/json' },
        cookies: { 'token': mainUser.token },
        tags: { name: '[PRJ] create-project' }
    });
    if (res.status !== 201)
        console.log(`[PRJ] create-project: failed with status ${res.status}, duration: ${res.timings.duration}`)
    check(res, {
        "response code was 201": (res) => res.status == 201,
        "response time < 3000ms": (res) => res.timings.duration < 3000
    })

    const body = res.json();
    return body && body.newProject ? body.newProject.projectId : null;
}

export function testEditProject(project, payload) {
    const targetProjectId = project ? project : getData.projectData('main-project')['projectId'];
    const res = http.patch(`https://mockapi.io.vn/api/projects/${mainUser.id}/${targetProjectId}`, payload, {
        headers: { "Content-Type": "application/json" },
        cookies: { token: mainUser.token },
        tags: { name: '[PRJ] edit-project' }
    })
    if (res.status !== 200)
        console.log(`[PRJ] edit-project: failed with status ${res.status}, duration: ${res.timings.duration}`)
    check(res, {
        "response was 200": (res) => res.status === 200,
        "response time < 3000ms": (res) => res.timings.duration < 3000
    })
}

export function testReadProjects() {
    const res = http.get(`https://mockapi.io.vn/api/projects/user/${mainUser.id}`, {
        cookies: { token: mainUser.token },
        tags: { name: '[PRJ] get-project' }
    })
    if (res.status !== 200)
        console.log(`[PRJ] get-project: failed with status ${res.status}, duration: ${res.timings.duration}`)
    check(res, {
        'response was 200': (res) => res.status === 200,
        'response time < 3000ms': (res) => res.timings.duration < 3000
    })
}

export function testRemoveProject(project) {
    const targetProjectId = project ? project : getData.projectData('project-for-deletion')['projectId']
    const res = http.del(`https://mockapi.io.vn/api/projects/${mainUser.id}/${targetProjectId}`, null, {
        cookies: { token: mainUser.token },
        tags: { name: '[PRJ] remove-project' }
    })
    if (res.status !== 200)
        console.log(`[PRJ] remove-project: failed with status ${res.status}, duration: ${res.timings.duration}`)
    check(res, {
        'response was 200': (res) => res.status === 200,
        'response time < 3000ms': (res) => res.timings.duration < 3000
    })
}
