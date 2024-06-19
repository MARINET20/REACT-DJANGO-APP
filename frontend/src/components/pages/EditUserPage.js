import React, { Component } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import { API_URL } from '../..';


export class EditUserPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userType: 'student',
            course: '',
            userName: null,
            userDirection: null,
            userCourse: null,
            users: [],
            teachers: [],
            selectedUser: null,
            selectedTeacher: null,
            teacherName: null,
            formData: {
                id: null,
                name:'',
                direction:'',
                course: null,
                isStudy: null,
                is_user:null,
                isWorking:null,
            },
            formTeacherData: {
                id: null,
                name:null,
                isWorking:null,
                is_user:null,
                direction:'',
                course: null,
                isStudy: null,
            },
        };
    }

    async componentDidMount() {
        try {
            const studResponse = await fetch(`${API_URL}/students`);
            const data = await studResponse.json();
            this.setState({ users: data });
    
            const teachersResponse = await fetch(`${API_URL}/teachers`);
            const teachersData = await teachersResponse.json();
            this.setState({ teachers: teachersData });
        } catch (error) {
            console.error('Ошибка при выборке данных:', error);
        }
    }

    onSelect = (selectedList) =>{
        this.setState({ selectedUser: selectedList[0] }); 
        this.setState({ userName: selectedList[0].name });
        this.setState({ userDirection: selectedList[0].direction });
        this.setState({ userCourse: selectedList[0].course });
    }

    onSelectTeacher = (selectedList) =>{
        this.setState({ selectedTeacher: selectedList[0] }); 
        this.setState({ teacherName: selectedList[0].name });
    }

    handleUserTypeChange = (e) => {
        this.setState({ userType: e.target.value });
    }

    handleNameChange = (e) => {
        this.setState({ userName: e.target.value });
    }

    handleTNameChange = (e) => {
        this.setState({ teacherName: e.target.value });
    }

    handleDirectionChange = (e) => {
        this.setState({ userDirection: e.target.value });
    }

    handleourseChange = (e) => {
        this.setState({ userCourse: e.target.value });
    }

    handleChange = (e) => {
        const value = e.target.value === 'yes' ? true : false;
        this.setState({ isUserCompleted: value });
    }

    handleStudentSubmit = async (e) => {
        e.preventDefault();

        const { formData } = this.state;
        formData.id = this.state.selectedUser.id;
        formData.name = this.state.userName;
        formData.direction = this.state.userDirection;
        formData.course = this.state.userCourse;
        formData.isStudy = this.state.isUserCompleted;
        formData.is_user = this.state.userType;


        this.setState({ formData });
        console.log(this.state.formData);

        try {
            const response = await fetch(`${API_URL}/edit/user`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state.formData),
            });

            if (response.ok) {
                const data = await response.json();
                this.setState({ message: data.message, error: null });
                alert('Пользователь успешно изменен');

                // Очистка полей после успешной отправки
                this.setState({
                    course: '',
                    userName: '',
                    userDirection: '',
                    userCourse: '',
                    users: [],
                    selectedUser: null,
                    formData: {
                        id: null,
                        name:'',
                        direction:'',
                        course: '',
                        isStudy: null,
                        is_user:null,
                        isWorking:null,
                    },
                })

            } else {
                const data = await response.json();
                this.setState({ error: data.error, message: null });
                alert(this.state.error);
            }
        } catch (error) {
            this.setState({ error: 'Ошибка при отправке данных', message: null });
            alert('Ошибка при отправке данных');
        }
    }

    handleTeacherSubmit = async (e) => {
        e.preventDefault();

        const { formTeacherData } = this.state;
        formTeacherData.id = this.state.selectedTeacher.id;
        formTeacherData.name = this.state.teacherName;
        formTeacherData.isWorking = this.state.isUserCompleted;
        formTeacherData.is_user = this.state.userType;
        this.setState({ formTeacherData });

        try {
            const response = await fetch(`${API_URL}/edit/user`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state.formTeacherData),
            });

            if (response.ok) {
                const data = await response.json();
                this.setState({ message: data.message, error: null });
                alert('Пользователь успешно изменен');

                // Очистка полей после успешной отправки
                this.setState({
                    teachers: [],
                    selectedTeacher: null,
                    teacherName: '',
                    formTeacherData: {
                        id: null,
                        name:'',
                        isWorking:null,
                        is_user:null,
                        direction:'',
                        course: null,
                        isStudy: null,
                    },
                })

            } else {
                const data = await response.json();
                this.setState({ error: data.error, message: null });
                alert(this.state.error);
            }
        } catch (error) {
            this.setState({ error: 'Ошибка при отправке данных', message: null });
            alert('Ошибка при отправке данных');
        }
    }

    render() {
        return (
            <div className='container'>
                <div className='pt-30'>
                    <h1 className="m-0" style={{color: '#00AEEF'}}>Редактировать пользователя</h1>
                </div>
                <div className="row mt-4">
                    <div className="col">
                        <label className="form-label" style={{fontWeight:'600'}}>Выберите тип пользователя:</label>
                        <select 
                            className="form-select" 
                            value={this.state.userType} 
                            onChange={this.handleUserTypeChange}
                        >
                            <option value="student">Студент</option>
                            <option value="teacher">Преподаватель</option>
                        </select>
                    </div>
                </div>
                {this.state.userType === 'student' && (
                    <form onSubmit={this.handleStudentSubmit}>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" style={{fontWeight:'600'}}>Выберите пользователя:</label>
                                <Multiselect
                                    options={this.state.users}
                                    placeholder="Пользователь"
                                    selectedValues={this.state.selectedUser ? [this.state.selectedUser] : []} 
                                    onSelect={this.onSelect} 
                                    onRemove={this.onSelect}
                                    displayValue="name"
                                />
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" style={{fontWeight:'600'}}>ФИО:</label>
                                <div>
                                    <textarea
                                        style={{resize: 'both', height: '50px', width: '1110px'}}
                                        value={this.state.userName}
                                        onChange={this.handleNameChange}
                                        >
                                    </textarea>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" style={{fontWeight:'600'}}>Направление:</label>
                                <div>
                                    <textarea
                                        style={{resize: 'both', height: '50px', width: '1110px'}}
                                        value={this.state.userDirection}
                                        onChange={this.handleDirectionChange}
                                        >
                                    </textarea>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" style={{fontWeight:'600'}}>Курс обучения:</label>
                                <div>
                                    <input 
                                    className="form-control" 
                                    type="number" 
                                    name="count" 
                                    min="2"
                                    max="6" 
                                    value={this.state.userCourse}
                                    onChange={this.handleCourseChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" style={{fontWeight:'600'}}>Обучается в университете?</label>
                                <div>
                                    <input type="radio" id="yes" name="drone" value="yes" onChange={this.handleChange} checked={this.state.isUserCompleted}/>
                                    <label htmlFor="yes">Да</label>
                                    <input type="radio" id="no" name="drone" value="no" style={{marginLeft:"10px"}}  onChange={this.handleChange}/>                            
                                    <label htmlFor="no">Нет</label>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary btn-sm mt-3" type="submit">Изменить пользователя</button>
                    </form>
                )}
                {this.state.userType === 'teacher' && (
                    <form onSubmit={this.handleTeacherSubmit}>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" style={{fontWeight:'600'}}>Выберите пользователя:</label>
                                <Multiselect
                                    options={this.state.teachers}
                                    placeholder="Пользователь"
                                    selectedValues={this.state.selectedTeacher ? [this.state.selectedTeacher] : []} 
                                    onSelect={this.onSelectTeacher} 
                                    onRemove={this.onSelectTeacher}
                                    displayValue="name"
                                />
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" style={{fontWeight:'600'}}>ФИО:</label>
                                <div>
                                    <textarea
                                        style={{resize: 'both', height: '50px', width: '1110px'}}
                                        value={this.state.teacherName}
                                        onChange={this.handleTNameChange}
                                        >
                                    </textarea>
                                </div>
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" style={{fontWeight:'600'}}>Преподает в университете?</label>
                                <div>
                                    <input type="radio" id="yes" name="drone" value="yes" onChange={this.handleChange} checked={this.state.isUserCompleted}/>
                                    <label htmlFor="yes">Да</label>
                                    <input type="radio" id="no" name="drone" value="no" style={{marginLeft:"10px"}}  onChange={this.handleChange} />                            
                                    <label htmlFor="no">Нет</label>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-primary btn-sm mt-3" type="submit">Изменить пользователя</button>
                    </form>
                )}
            </div>
        )
    }
}

export default EditUserPage