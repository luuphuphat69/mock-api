import http from 'k6/http';
import { check, sleep } from 'k6';
import getData from '../../utilities/getdata.js';

const mainUser = getData.userData('main-user')
const mainProject = getData.projectData('main-project')

export function testCreateResource(project, payload) {
    const selectedProject = project ? project : mainProject.projectId
    const res = http.post(`https://mockapi.io.vn/api/resources/${mainUser.id}/${selectedProject}`, payload, {
        headers: { 'Content-type': 'application/json' },
        cookies: { 'token': mainUser.token },
        tags: { name: '[RES] create-resource' }
    });

    check(res, {
        "response status is 200": (res) => res.status === 200,
        "response time < 3000ms": (res) => res.timings.duration < 3000
    })
    const body = res.json();
    return body && body.resource ? body.resource._id : null;
}

export function testEditResource(project, resource, payload) {
    let selectedProject = mainProject.projectId;
    let selectedResource = mainProject.resourceId;

    if (project && resource) {
        selectedProject = project
        selectedResource = resource
    }
    const res = http.patch(`https://mockapi.io.vn/api/resources/${mainUser.id}/${selectedProject}/${selectedResource}`, payload, {
        headers: { 'Content-type': 'application/json' },
        cookies: { 'token': mainUser.token },
        tags: { name: '[RES] edit-resource' }
    })
    
    check(res, {
        "response status is 200": (res) => res.status === 200,
        "response time < 3000ms": (res) => res.timings.duration < 3000
    })
}

export function testReadResources(project) {
    const selectedProject = project ? project : mainProject.projectId
    const res = http.get(`https://mockapi.io.vn/api/resources/${mainUser.id}/${selectedProject}`, {
        cookies: {token: mainUser.token},
        tags: { name: '[RES] read-resource' }
    })
    check(res, {
        'response was 200': (res) => res.status === 200,
        'response time < 3000ms': (res) => res.timings.duration < 3000
    })
}

export function testRemoveResource(project, resource) {
    let selectedProject = mainProject.projectId;
    let selectedResource = mainProject.resourceId;

    if (project && resource) {
        selectedProject = project;
        selectedResource = resource;
    }

    const res = http.del(`https://mockapi.io.vn/api/resources/${mainUser.id}/${selectedProject}/${selectedResource}`, null, {
        cookies: {token: mainUser.token},
        tags: { name: '[RES] remove-resource' }
    })
    check(res, {
        'response was 200': (res) => res.status === 200,
        'response time < 3000ms': (res) => res.timings.duration < 3000
    })
}
