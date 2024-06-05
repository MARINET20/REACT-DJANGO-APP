import React, { Component } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import RequirementList from './RequirementList';
import { API_URL } from '../..';

export class AddOtherProject extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedProject: null,
            projectName: null,
            projectDescription: null,
            projectCount: null,
            selectedTags: [],
            selectedSkills: [],
            selectedTeachers: [],
            selectedStudents: [],
            isFormTagVisible: false,
            tags: [],
            skills:[],
            teachers:[],
            students:[],
            formData: {
                id: null,
                title:'',
                description:'',
                count: null,
                tags: [],
                skills: [],
                status: true,
                teachers: [],
                students:[]
            },
            message: null,
            error: null,
        };
    }

    async componentDidMount() {
        try {
            const tagsResponse = await fetch(`${API_URL}/tags`);
            const tagsData = await tagsResponse.json();
            this.setState({ tags: tagsData });
    
            const teachersResponse = await fetch(`${API_URL}/teachers`);
            const teachersData = await teachersResponse.json();
            this.setState({ teachers: teachersData });

            const skillsResponse = await fetch(`${API_URL}/skill`);
            const skillsData = await skillsResponse.json();
            this.setState({ skills: skillsData });

            const studentsResponse = await fetch(`${API_URL}/students`);
            const studentsData = await studentsResponse.json();
            this.setState({ students: studentsData });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    toggleFormTagVisibility = () => {
        this.setState({ isFormTagVisible: !this.state.isFormTagVisible});
    };

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [name]: value
            }
        }));
    }

    handleTagChange = (selectedList) => {
        this.setState({ selectedTags: selectedList });
    }

    handleTeachersChange = (selectedList) => {
        this.setState({ selectedTeachers: selectedList });
    }

    handleStudentsChange = (selectedList) => {
        this.setState({ selectedStudents: selectedList });
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        const selectedSkill = JSON.parse(localStorage.getItem('selectedSkill')) || [];
        const { formData, selectedTags, selectedTeachers } = this.state;
        formData.tags = selectedTags;
        formData.skills = selectedSkill;
        formData.teachers = selectedTeachers;
        this.setState({ formData });

        console.log(this.state.formData);

        try {
            const response = await fetch(`${API_URL}/add-other-project`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state.formData),
            });

            if (response.ok) {
                this.setState({ message: 'Проект успешно создан', error: null });
                alert('Проект успешно создан');
            } else {
                const data = await response.json();
                this.setState({ error: data.error, message: null });
                alert('Не все поля заполнены!');
            }
        } catch (error) {
            this.setState({ error: "Ошибка при создании проекта", message: null });
            console.error(this.state.error);
            alert('Ошибка при создании проекта');
        }
        // очистить все формы заполняемые 
        // formData.tags = null;
        // formData.skills = null;
        // formData.teachers = null;
        // formData.count = null;
        // formData.title = null;
        // formData.description = null;
        // this.setState({ formData });

        // this.setState({ formData: {}, 
        //     selectedProject: null,
        //     projectName: null,
        //     projectDescription: null,
        //     projectCount: null,
        //     selectedTags: [],
        //     selectedSkills: [],
        //     selectedTeachers: [] });
        // localStorage.removeItem('selectedSkill');
    };


  render() {
    return (
        <form onSubmit={this.handleSubmit} className='mt-3'>
            <div className="row">
                <div className="col">
                    <label className="form-label" htmlFor="title" style={{fontWeight:'600'}}>Название проекта</label>
                    <input className="form-control" type="text" name="title" value={this.state.formData.title} onChange={this.handleChange} />
                </div>
            </div>
            <div className="row mt-3">
                <div className="col">
                    <label className="form-label" htmlFor="description" style={{fontWeight:'600'}}>Описание проекта</label>
                    <textarea className="form-control" name="description" value={this.state.formData.description} onChange={this.handleChange}></textarea>
                </div>
            </div>
            <div className="row mt-3">
                <div className="col">
                    <label className="form-label" htmlFor="teacher" style={{fontWeight:'600'}}>Куратор проекта</label>
                    <Multiselect
                        options={this.state.teachers ? this.state.teachers : []}
                        selectedValues={this.state.selectedTeachers}
                        onSelect={this.handleTeachersChange}
                        onRemove={this.handleTeachersChange}
                        displayValue="name"
                        placeholder='куратор проекта'
                    />
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <label className="form-label" style={{fontWeight:'600'}}>Теги проекта</label>
                    <Multiselect
                        options={this.state.tags ? this.state.tags : []}
                        selectedValues={this.state.selectedTags}
                        onSelect={this.handleTagChange}
                        onRemove={this.handleTagChange}
                        displayValue="tag"
                        placeholder='теги проекта'
                    />
                </div>
            </div>
            {/* <div className='mt-2 d-flex'>
                <img width="32" height="32" 
                onClick={this.toggleFormTagVisibility}
                style={{ cursor: 'pointer', marginLeft:'5px'}}
                src="https://img.icons8.com/small/32/00abed/add.png" alt="add"/>
                <p style={{ color: "#00aeef"}}><small>Добавить теги, которых нет в списке</small></p>
            </div>
            { this.state.isFormTagVisible && (
                <AddTagsForProject/>
            )} */}
            <div className="row mt-4">
                <div className="col">
                    <label className="form-label" style={{fontWeight:'600'}}>Команда проекта</label>
                    <Multiselect
                        options={this.state.students ? this.state.students : []}
                        selectedValues={this.state.selectedStudents}
                        onSelect={this.handleStudentsChange}
                        onRemove={this.handleStudentsChange}
                        displayValue="name"
                        placeholder='студенты'
                    />
                </div>
            </div>
            <div className='mt-3'>
                <label className="form-label" style={{fontWeight:'600'}}>Требования проекта</label>
                    <RequirementList/>
            </div>
            <button className="btn btn-primary btn-sm mt-3" type="submit">Добавить</button>
        </form>
    )
  }
}

export default AddOtherProject