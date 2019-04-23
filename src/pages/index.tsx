import * as React from "react";
import { Container, Row, Col, CardGroup, Spinner } from "react-bootstrap";
import { Helmet } from "react-helmet";

import ProjectsPanel from "../project/ProjectsPanel";
import ProjectJsonPanel from "../project/ProjectJsonPanel";
import TransformScriptPanel from "../transform/TransformScriptPanel";
import TransformDialog from "../transform/TransformDialog";
import { ReaperProject, IRppData, importProjects } from "../project/reaperProject";
import { allScripts, ITransformScript, runTransformScript } from "../transform/transformScript";

import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "../styles.css";

export default () => {
  const [projects, setProjects] = React.useState<ReaperProject[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<ReaperProject | null>(null);
  const [sourceProject, setSourceProject] = React.useState<ReaperProject | null>(null);
  const [script, setScript] = React.useState(allScripts[0]);
  const [scriptText, setScriptText] = React.useState(allScripts[0].script);
  const [projectJson, setProjectJson] = React.useState("");
  const [isRunning, setRunning] = React.useState(false);
  const [transformedRpps, setTransformedRpps] = React.useState<IRppData[]>([]);

  const handleTransformClick = async () => {
    if (sourceProject === null) {
      return;
    }

    setRunning(true);

    try {
      const source = await sourceProject.getData();
      const othersPromise = projects.filter(proj => proj.id !== sourceProject.id).map(proj => proj.getData());

      const others = await Promise.all(othersPromise);
      const transformedRpps = await runTransformScript(scriptText, source, others);
      setTransformedRpps(transformedRpps);

      setRunning(false);
    } catch (e) {
      alert(`Error: ${e.message}`);
      setTransformedRpps([]);
      setRunning(false);
    }
  };

  const handleTransformDialogClose = () => setTransformedRpps([]);

  const handleFileImport = async (files: FileList | null) => {
    if (!files) {
      return;
    }

    const importedProjects = await importProjects(files);
    if (!importedProjects) {
      return;
    }

    if (!selectedProject) {
      updateSelectedProject(importedProjects[0]);
    }

    if (!sourceProject) {
      setSourceProject(importedProjects[0]);
    }

    setProjects([...projects, ...importedProjects]);
  };

  const handleSetSourceClick = (project: ReaperProject) => {
    setSourceProject(project);
  };

  const handleDeleteClick = (project: ReaperProject) => {
    const index = projects.findIndex(proj => proj.id === project.id);
    const newProjects = projects.filter(proj => proj.id !== project.id);
    setProjects(newProjects);

    const newIndex = index < newProjects.length ? index : newProjects.length - 1;
    if (newIndex < 0) {
      updateSelectedProject(null);
      setSourceProject(null);
      return;
    }

    if (selectedProject && project.id === selectedProject.id) {
      updateSelectedProject(newProjects[newIndex]);
    }

    if (sourceProject && project.id === sourceProject.id) {
      setSourceProject(newProjects[newIndex]);
    }
  };

  const handleScriptChange = (selectedScript: ITransformScript) => {
    setScript(selectedScript);
    setScriptText(selectedScript.script);
  };

  const handleScriptTextChange = (text: string) => {
    setScriptText(text);
  };

  const updateSelectedProject = (project: ReaperProject | null) => {
    setSelectedProject(project);

    if (project) {
      project
        .getData()
        .then(obj => setProjectJson(JSON.stringify(obj, null, 2)))
        .catch(error => console.log((error as Error).message));
    } else {
      setProjectJson("");
    }
  };

  const title = selectedProject ? `JSON for ${selectedProject.name}` : "No Project Selected";

  return (
    <Container fluid>
      <Helmet>
        <title>ReaTransform</title>
      </Helmet>

      <Row className="app-header">ReaTransform</Row>

      <Row className="app-content">
        <Col lg="3">
          <ProjectsPanel
            projects={projects}
            selectedProject={selectedProject!}
            sourceProject={sourceProject!}
            onFileImport={files => handleFileImport(files)}
            onProjectClick={project => updateSelectedProject(project)}
            onSetSourceClick={project => handleSetSourceClick(project)}
            onDeleteClick={project => handleDeleteClick(project)}
          />
        </Col>

        <Col lg>
          <CardGroup className="h-100">
            <TransformScriptPanel
              script={script}
              scriptText={scriptText}
              allScripts={allScripts}
              canRun={projects.length > 0}
              isRunning={isRunning}
              onScriptChange={s => handleScriptChange(s)}
              onScriptTextChange={t => handleScriptTextChange(t)}
              onTransformClick={() => handleTransformClick()}
            />

            <ProjectJsonPanel title={title} json={projectJson} />
          </CardGroup>
        </Col>
      </Row>

      <TransformDialog
        show={transformedRpps.length > 0}
        transformedRpps={transformedRpps}
        onClose={() => handleTransformDialogClose()}
      />
    </Container>
  );
};
