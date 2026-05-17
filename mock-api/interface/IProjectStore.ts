interface IProjectStore {
  projects: IProject[];
  collabProjects: IProject[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  fetchCollabProjects: () => Promise<void>;
  addProject: (payload: object) => Promise<void>;
  updateProject: (id: string, updates: Partial<IProject>) => void;
  deleteProject: (id: string) => Promise<void>;
  clearProjects:() => void;
  patchProject:(id: string, payload: object) =>Promise<void>
  deleteCollabProject:(id: string) => void
}
