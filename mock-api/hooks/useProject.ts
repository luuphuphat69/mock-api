import { create } from "zustand";
import { getProjectByUserID, addNewProject, deleteProjectByID, patchProject, getCollabProject } from "@/utilities/api/api";

export const useProjects = create<IProjectStore>((set, get) => ({
    projects: [],
    collabProjects:[],
    loading: false,

    fetchProjects: async (userId: string) => {
        set({ loading: true });
        try {
            const res = await getProjectByUserID(userId);
            set({ projects: res });
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        } finally {
            set({ loading: false });
        }
    },

    fetchCollabProjects: async (userId: string) => {
        set({loading: true});
        try{
            const res = await getCollabProject(userId);
            set({collabProjects: res})
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        } finally {
            set({ loading: false });
        }
    },

    addProject: async (newProject) => {
        try {
            const res = await addNewProject(newProject);
            set({
                projects: [...get().projects, res.data.newProject]
            });
        } catch (err) {
            console.error(err);
            throw err;
        }
    },

    updateProject: (id, updates) => {
        set({
            projects: get().projects.map(p => p.projectId === id ? { ...p, ...updates } : p)
        });
    },

    deleteProject: async (userid:string, id: string) => {
        try {
            await deleteProjectByID(userid, id)
            set({ projects: get().projects.filter(p => p.projectId !== id) });
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
    clearProjects: () => {
        set({
            projects: [],
            loading: false
        });
    },
    patchProject: async (userid: string, id: string, payload: { name?: string; prefix?: string }) => {
        try {
            const res = await patchProject(userid, id, payload);

            set({
                projects: get().projects.map((p) =>
                    p.projectId === id ? { ...p, ...payload } : p
                )
            });

            return res;
        } catch (err) {
            console.error("Patch project failed:", err);
            throw err;
        }
    }
}));