import React, { Component } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import MyComponentTag from './MyComponentTag';
import CuratorProject from './CuratorProject';
import RequirementList from './RequirementList';
import { API_URL } from '../..';

export class EditProjectPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: [],
            selectedProject: null,
            projectName: null,
            projectDescription: null,
            projectCount: null,
            selectedTags: [],
            selectedSkills: [],
            selectedStudents: [],
            selectedRezervStudents: [],
            selectedTeachers: [],
            isFormVisible: false,
            isFormTagVisible: false,
            isFormCuratorVisible: false,
            formData: {
                id: null,
                title:'',
                description:'',
                count: null,
                tags: [],
                skills: [],
                students: [],
                status: null,
                teachers: []
            },
            isProjectCompleted: null,
            isChekIT: false, 
            message: null,
            error: null
        };
    }

    componentDidMount() {
        fetch(`${API_URL}/`) 
        .then(response => response.json())
        .then(data => {
            this.setState({ projects: data });
        });
    }

    onSelect = (selectedList) =>{
        this.setState({ selectedProject: selectedList[0] }); 
        this.setState({ projectName: selectedList[0].title });
        this.setState({ projectDescription: selectedList[0].description });
        this.setState({ selectedTags: selectedList[0].tags });
        this.setState({ projectCount: selectedList[0].count });
        this.setState({ selectedStudents: selectedList[0].students });
        this.setState({ selectedTeachers: selectedList[0].teachers });
        this.setState({ isProjectCompleted: selectedList[0].status });
    }

    handleNameChange = (e) => {
        this.setState({ projectName: e.target.value });
    }

    handleDescriptionChange = (e) => {
        this.setState({ projectDescription: e.target.value });
    }

    handleCountChange = (e) => {
        this.setState({ projectCount: e.target.value });
    }
    
    handleTagsChange = (selectedList) => {
        this.setState({ selectedTags: selectedList });
    }

    handleSkillsChange = (selectedList) => {
        this.setState({ selectedSkills: selectedList });
        
    }

    handleStudentsChange = (selectedList) => {
        this.setState({ selectedStudents: selectedList });
    }
    handleTeachersChange = (selectedList) => {
        this.setState({ selectedTeachers: selectedList });
    }

    updateWeight = (id, newWeight) => {
        this.setState((prevState) => ({
            selectedProject: {
              ...prevState.selectedProject,
              skills: prevState.selectedProject.skills.map(req => {
            if (req.id === id) {
                return {...req, weight_skill: newWeight};
            }
            return req;
        })}}));
    };

    removeRequirement = (id) => {
        this.setState((prevState) => ({
            selectedProject: {
              ...prevState.selectedProject,
              skills: prevState.selectedProject.skills.filter(req => req.id !== id)
            }
        }));
    };

    toggleFormVisibility = () => {
        this.setState({ isFormVisible: !this.state.isFormVisible});
    };

    toggleFormTagVisibility = () => {
        this.setState({ isFormTagVisible: !this.state.isFormTagVisible});
    };

    toggleFormCuratorVisibility = () => {
        this.setState({ isFormCuratorVisible: !this.state.isFormCuratorVisible});
    };


    handleSubmit = async (e) => {
        e.preventDefault();
        const selectedSkill = JSON.parse(localStorage.getItem('selectedSkill')) || [];
        const selectedTag = JSON.parse(localStorage.getItem('selectedTags')) || [];
        const selectedCurator = JSON.parse(localStorage.getItem('selectedCurators')) || [];
        const { formData } = this.state;
        formData.id = this.state.selectedProject.id;
        formData.title = this.state.projectName;
        formData.description = this.state.projectDescription;
        formData.count = this.state.projectCount;
        formData.teachers = this.state.selectedTeachers.map(name => name.id).concat(selectedCurator);
        formData.students = this.state.selectedStudents.map(student => student.id);
        formData.tags = this.state.selectedTags.map(tag => tag.id).concat(selectedTag);
        formData.skills = this.state.selectedProject.skills.concat(selectedSkill);
        formData.status = this.state.isProjectCompleted;
        this.setState({ formData });

        try {
          const response = await fetch(`${API_URL}/edit/project`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(this.state.formData),
          });
                
          if (response.ok) {
            alert('Проект успешно изменен');

            // Очистка полей после успешной отправки
            this.setState({
                selectedProject: null,
                projectName: '',
                projectDescription: '',
                projectCount: '',
                selectedTags: [],
                selectedSkills: [],
                selectedStudents: [],
                selectedRezervStudents: [],
                selectedTeachers: [],
            });

          } else {
            const data = await response.json();
            alert(data);
          }
        } catch (error) {
            alert('Ошибка при отправке данных');
        }
        localStorage.clear('selectedSkill')
        localStorage.clear('selectedTags')
        localStorage.clear('selectedCurators')
    }

    handleChange = (e) => {
        const value = e.target.value === 'yes' ? true : false;
        this.setState({ isProjectCompleted: value });
    }

  render() {
    return (
        <div className='container'>
            <div className='pt-30 d-flex justify-content-between'>
                <h1 className="m-0" style={{color: '#00AEEF'}}>Изменить проект</h1>
            </div>
                <form onSubmit={this.handleSubmit}>
                    <div className="row mt-3">
                        <div className="col">
                            <label className="form-label" style={{fontWeight:'600'}}>Выберите проект:</label>
                            <Multiselect
                                options={this.state.projects}
                                placeholder="Проект"
                                selectedValues={this.state.selectedProject ? [this.state.selectedProject] : []} 
                                onSelect={this.onSelect} 
                                onRemove={this.onSelect}
                                displayValue="title"
                            />
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col">
                            <label style={{fontWeight:'600'}}>
                                Название проекта:
                                <div>
                                    <textarea
                                        style={{resize: 'both', height: '50px', width: '1110px'}}
                                        value={this.state.projectName}
                                        onChange={this.handleNameChange}>
                                    </textarea>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col">
                            <label style={{fontWeight:'600'}}>
                                Описание проекта:
                                <div>
                                    <textarea
                                        style={{resize: 'both', height: '100px', width: '1110px'}}
                                        value={this.state.projectDescription}
                                        onChange={this.handleDescriptionChange}>
                                    </textarea>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col">
                            <label style={{fontWeight:'600'}}>
                                Количество участников:
                                <div>
                                    <input 
                                    className="form-control" 
                                    type="number" 
                                    name="count" 
                                    min="2"
                                    max="10"
                                    value={this.state.projectCount} 
                                    onChange={this.handleCountChange} />
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col">
                            <label style={{fontWeight:'600'}}>
                                Теги проекта:
                                <Multiselect
                                    options={this.state.selectedProject ? this.state.selectedProject.tags : []}
                                    selectedValues={this.state.selectedTags}
                                    onSelect={this.handleTagsChange}
                                    onRemove={this.handleTagsChange}
                                    displayValue="tag"
                                    placeholder='теги проекта'
                                />
                            </label>
                        </div>
                    </div>
                    <div className="mt-2 d-flex">
                        <img width="32" height="32" 
                        onClick={this.toggleFormTagVisibility}
                        style={{ cursor: 'pointer', marginLeft:'5px'}}
                        src="https://img.icons8.com/small/32/00abed/add.png" alt="add"/>
                        <p className="" style={{ color: "#00aeef"}}><small>Добавить теги</small></p>
                    </div>
                    { this.state.isFormTagVisible && (
                        <div>
                            < MyComponentTag/>
                        </div>
                    )}
                    <div className="row mt-3">
                        <div className="col">
                            <label style={{fontWeight:'600'}}>
                                Куратор проекта:
                                <Multiselect
                                    options={this.state.selectedProject ? this.state.selectedProject.teachers : []}
                                    selectedValues={this.state.selectedTeachers}
                                    onSelect={this.handleTeachersChange}
                                    onRemove={this.handleTeachersChange}
                                    displayValue="name"
                                    placeholder='куратор проекта'
                                />
                            </label>
                        </div>
                    </div>
                    <div className="mt-2 d-flex">
                        <img width="32" height="32" 
                        onClick={this.toggleFormCuratorVisibility}
                        style={{ cursor: 'pointer', marginLeft:'5px'}}
                        src="https://img.icons8.com/small/32/00abed/add.png" alt="add"/>
                        <p style={{ color: "#00aeef"}}><small>Добавить куратора(ов)</small></p>
                    </div>
                    { this.state.isFormCuratorVisible && (
                        <div>
                            < CuratorProject/>
                        </div>
                    )}
                    <div className="row mt-3">
                        <div className="col">
                        <label style={{fontWeight:'600'}}>
                            Требования проекта:
                            {this.state.selectedProject && this.state.selectedProject.skills.length > 0 ? (
                                <ul>
                                    {this.state.selectedProject.skills.map(req => (
                                        <li key={req.id} style={{marginBottom: '10px', fontWeight:'400'}}>
                                            {req.skill} - уровень значимости:
                                            <div>
                                            {[...Array(10)].map((_, index) => (
                                                <svg key={index} xmlns="http://www.w3.org/2000/svg" width="15" height="15" style={{fill: index < Math.round(req.weight_skill * 10) ? '#f0c313' : '#b9b9b9', margin: '3px 1px', cursor: 'pointer', marginLeft: '10px'}} onClick={() => this.updateWeight(req.id, (index + 1) / 10)}>
                                                    <path d="M7.5 0l2.3 4.6h4.7l-3.4 3.3 1.2 6.6-6-3.4-6 3.4 1.3-6.6-3.4-3.3h4.6z"/>
                                                </svg>
                                            ))}
                                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0,0,300,150"
                                                style={{fill:"#ef627d", marginBottom:'10px', marginLeft:'10px', cursor:'pointer'}} onClick={() => this.removeRequirement(req.id)}  >
                                                <g fill="#ef627d" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: "normal"}}>
                                                <g transform="scale(10.66667,10.66667)">
                                                    <path d="M4.99023,3.99023c-0.40692,0.00011 -0.77321,0.24676 -0.92633,0.62377c-0.15312,0.37701 -0.06255,0.80921 0.22907,1.09303l6.29297,6.29297l-6.29297,6.29297c-0.26124,0.25082 -0.36647,0.62327 -0.27511,0.97371c0.09136,0.35044 0.36503,0.62411 0.71547,0.71547c0.35044,0.09136 0.72289,-0.01388 0.97371,-0.27511l6.29297,-6.29297l6.29297,6.29297c0.25082,0.26124 0.62327,0.36648 0.97371,0.27512c0.35044,-0.09136 0.62411,-0.36503 0.71547,-0.71547c0.09136,-0.35044 -0.01388,-0.72289 -0.27512,-0.97371l-6.29297,-6.29297l6.29297,-6.29297c0.25082,-0.26124 0.36648,-0.62327 0.27512,-0.97371c-0.09136,-0.35044 -0.36503,-0.62411 -0.71547,-0.71547c-0.35045,-0.09136 -0.72289,0.01388 -0.97371,0.27511l-6.29297,6.29297l-6.29297,-6.29297c-0.25852,-0.29831 -0.69317,-0.35115 -0.9929,-0.09205c-0.29972,0.2591 -0.35116,0.69378 -0.09205,0.99351c0.09461,0.10954 0.23421,0.19187 0.39324,0.23504z"></path>
                                                </g>
                                                </g>
                                            </svg>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                null
                            )}
                        </label>
                        </div>
                    </div>

                    <div className='d-flex'>
                        <img width="32" height="32" 
                        onClick={this.toggleFormVisibility}
                        style={{ cursor: 'pointer'}}
                        src="https://img.icons8.com/small/32/00abed/add.png" alt="add"/>
                        <p className="m-0" style={{ color: "#00aeef"}}><small>Добавить новые требования</small></p>
                    </div>
                    { this.state.isFormVisible && (
                        <RequirementList/> 
                    )}
                    <div className="row mt-3">
                        <div className="col">
                            <label style={{fontWeight:'600'}}>
                                Команда проекта:
                                <Multiselect
                                    options={this.state.selectedProject ? this.state.selectedProject.students : []}
                                    selectedValues={this.state.selectedStudents}
                                    onSelect={this.handleStudentsChange}
                                    onRemove={this.handleStudentsChange}
                                    displayValue="name"
                                    placeholder='команда проекта'
                                />
                            </label>
                        </div>
                    </div>
                    {/* {this.state.selectedProject && this.state.projectCount !== this.state.selectedProject.students && (
                        <div className="row mt-3">
                            <div className="col">
                            <label style={{ fontWeight: '600' }}>
                                Резерв проекта:
                                {this.state.selectedProject && this.state.selectedProject.selected_students && (
                                <Multiselect
                                    options={this.state.selectedProject.selected_students.slice().sort((a, b) => b.student.average - a.student.average)}
                                    selectedValues={this.state.selectedRezervStudents}
                                    // onSelect={this.handleStudentsChange}
                                    // onRemove={this.handleStudentsChange}
                                    // displayFormat={(option) => `${option.student.name} (Средний балл: ${option.student.average})`}
                                    placeholder="резерв проекта"
                                />
                                )}
                            </label>
                            </div>
                        </div>
                    )} */}
                    <div className="row mt-3">
                        <div className="col">
                            <label style={{fontWeight:'600'}}>
                                Завершить проект?
                            </label>
                            <div>
                                <input type="radio" id="yes" name="drone" value="yes" onChange={this.handleChange} />
                                <label htmlFor="yes">Да</label>
                                <input type="radio" id="no" name="drone" value="no" style={{marginLeft:"10px"}} onChange={this.handleChange}/>                            
                                <label htmlFor="no">Нет</label>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-primary btn-sm mt-3" type="submit">Изменить проект</button>
                </form>
        </div>
    )
  }
}

export default EditProjectPage