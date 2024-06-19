import Multiselect from 'multiselect-react-dropdown';
import RequirementList from './pages/RequirementList';
import React, { Component } from 'react';
import AddOtherProject from './pages/AddOtherProject';
import AddTagsForProject from './pages/AddTagsForProject';
import AuthContext from './AuthContext'
import { API_URL } from '..';


export class CreateProject extends Component {
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
            isFormTagVisible: false,
            tags: [],
            skills:[],
            teachers:[],
            formData: {
                id: null,
                title:'',
                description:'',
                count: null,
                tags: [],
                newTags: [],
                skills: [],
                status: false,
                teachers: [],
                image: null
            },
            message: null,
            error: null,
            isChecked: false,
            is_user:null,
        };
    }

    componentDidMount() {
        Promise.all([
            fetch(`${API_URL}/tags`),
            fetch(`${API_URL}/teachers`),
            fetch(`${API_URL}/skill`)
        ])
        .then(([res1, res2, res3]) => Promise.all([res1.json(), res2.json(), res3.json()]))
        .then(([data1, data2, data3]) => {
            this.setState({
                tags: data1,
                teachers: data2,
                skills: data3
            });
        });
    }

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

    handleSubmit = async (e) => {
        e.preventDefault();
        const selectedSkill = JSON.parse(localStorage.getItem('selectedSkill')) || [];

        const { formData, selectedTags, selectedTeachers } = this.state;

         // Проверка на пустые поля
         if (
            !formData.count ||
            !formData.title ||
            !formData.description
        ) {
            alert('Не все поля заполнены');
            return;
        }

        const savedTags = localStorage.getItem('projectTags');
        if (savedTags) {
            formData.newTags = [...JSON.parse(savedTags)];
        }

        formData.tags = selectedTags;
        formData.skills = selectedSkill;
        formData.teachers = selectedTeachers;
        this.setState({ formData });

        try {
            const response = await fetch(`${API_URL}/add/project`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state.formData),
            });

            if (response.ok) {
                this.setState({ message: 'Проект успешно создан', error: null });
                alert('Проект успешно создан');
                
                // Очистка полей после успешной отправки
                this.setState({
                    selectedProject: null,
                    projectName: '',
                    projectDescription: '',
                    projectCount: '',
                    selectedTags: [],
                    selectedSkills: [],
                    selectedTeachers: [],
                    isFormTagVisible: false,
                    tags: [],
                    skills:[],
                    teachers:[],
                    formData: {
                        id: null,
                        title:'',
                        description:'',
                        count: '',
                        tags: '',
                        newTags: [],
                        skills: [],
                        status: false,
                        teachers: [],
                        image: null
                    },
                });
                localStorage.removeItem('selectedSkill');
                localStorage.removeItem('projectTags');
            } else {
                const data = await response.json();
                this.setState({ error: data.error, message: null });
                alert('Не все поля заполнены');
            }
        } catch (error) {
            alert('Ошибка при создании проекта');
            console.error(this.state.error);
        }
        
    };

    handleChecked  = () => {
        this.setState({ isChecked: !this.state.isChecked });
    }

    // сохранение фотографии в бд
    handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            this.setState({
                formData: {
                    ...this.state.formData,
                    image: event.target.result
                }
            });
        };
        
        reader.readAsDataURL(file);
    }

    toggleFormTagVisibility = () => {
        this.setState({ isFormTagVisible: !this.state.isFormTagVisible});
    };

    render() {

        return (
        <AuthContext.Consumer>
            {({ user }) => (
            <div>
                {user ? (
                    <div className='container'>
                        <div className='pt-30 d-flex mt-3 justify-content-between'>
                            <h1 className=" m-0" style={{color: '#00AEEF'}}>Создать проект</h1>  
                            {/* <label>
                                <span style={{color:'#b3b3b3'}}>Добавить сторонний проект</span>
                                <input type="checkbox" style={{marginLeft:'5px'}} onChange={this.handleChecked}/>
                            </label> */}
                        </div>
                        {this.state.isChecked ? ( 
                            <div>
                                <AddOtherProject/>
                            </div>
                        ) : (
                        <form onSubmit={this.handleSubmit} className='mt-3'>
                            <div className="row">
                                <div className="col">
                                    <label className="form-label" htmlFor="title" style={{fontWeight:'600'}}>Название</label>
                                    <input className="form-control" type="text" name="title" value={this.state.formData.title} onChange={this.handleChange} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col">
                                    <label className="form-label" htmlFor="description" style={{fontWeight:'600'}}>Описание</label>
                                    <textarea className="form-control" name="description" value={this.state.formData.description} onChange={this.handleChange}></textarea>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col">
                                    <label className="form-label" htmlFor="image" style={{fontWeight:'600'}}>Фотография</label>
                                    <input className="form-control" type="file" name="image" onChange={this.handleImageChange} />
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col">
                                    <label className="form-label" htmlFor="count" style={{fontWeight:'600'}}>Количество участников</label>
                                    <input 
                                        className="form-control" 
                                        type="number" 
                                        name="count" 
                                        min="2"
                                        max="5"
                                        value={this.state.formData.count} 
                                        onChange={this.handleChange} />
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col">
                                    <label className="form-label" htmlFor="teacher" style={{fontWeight:'600'}}>Куратор</label>
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
                                    <label className="form-label" style={{fontWeight:'600'}}>Теги</label>
                                    <Multiselect
                                        options={this.state.tags ? this.state.tags : []}
                                        selectedValues={this.state.selectedTags}
                                        onSelect={this.handleTagChange}
                                        onRemove={this.handleTagChange}
                                        displayValue="tag"
                                        placeholder='выберите теги из списка'
                                    />
                                </div>
                            </div>
                            <div className='mt-2 d-flex'>
                                <img width="32" height="32" 
                                onClick={this.toggleFormTagVisibility}
                                style={{ cursor: 'pointer', marginLeft:'5px'}}
                                src="https://img.icons8.com/small/32/00abed/add.png" alt="add"/>
                                <p style={{ color: "#00aeef"}}><small>Добавить теги, которых нет в списке</small></p>
                            </div>
                            { this.state.isFormTagVisible && (
                                <AddTagsForProject/>
                            )}
                            <div className='mt-4'>
                                <label className="form-label" style={{fontWeight:'600'}}>Требования</label>
                                    <RequirementList/>
                            </div>
                            <button className="btn btn-primary btn-sm mt-3" type="submit">Создать проект</button>
                        </form>
                        )}
                    </div>
                ) : null }
            </div>
            )}
            </AuthContext.Consumer>
        )}
    }

export default CreateProject;