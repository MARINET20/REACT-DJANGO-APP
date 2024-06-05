import React, { Component } from 'react'
import Multiselect from 'multiselect-react-dropdown';
import { API_URL } from '../..';
import AuthContext from '../AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';




export class SearchTeamPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            projects: [],
            selectedProject: null,
            showNextPage: false,
            projectFieldsVisible: true,
            formData: {
                id: null,
                title: null,
                count: null,
                participants_count: null,
            }, 
            is_user: null
        };
    }
    componentDidMount() {
        fetch(`${API_URL}/filter/project`) 
        .then(response => response.json())
        .then(data => {
            this.setState({ projects: data });
        });

        this.fetchUserData();
    }

    fetchUserData = async () => {
        const authTokens = JSON.parse(localStorage.getItem('authTokens'));
        if (authTokens) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;
            const decodedUser = jwtDecode(authTokens.access);
            try {
                const userResponse = await axios.get(`${API_URL}/user/${decodedUser.user_id}`)
                this.setState({
                    is_user: userResponse.data,
                });
            } catch (error) {
                console.error('Ошибка при получении пользовательских данных:', error);
            }
        }
    };

    onSelect = (selectedList, selectedItem) => {
        this.setState({ selectedProject: selectedItem });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        if (this.state.selectedProject) {
            console.log(this.state.selectedProject);
        }
    }

    handleNextClick = (e) => {
        this.setState({
            showNextPage: true,
            projectFieldsVisible: false
        });      
    }


  render() {
    const { is_user } = this.state;

    return (
    <AuthContext.Consumer>
    {({ user }) => (
      <div>
        { user && is_user && !is_user.is_student &&(
        <div className='container'>
        {this.state.projectFieldsVisible && (
            <div>
                <div className='pt-30'>
                    <h1 className=" m-0" style={{color: '#00AEEF'}}>Команда</h1>  
                </div>
                <label className="form-label mt-3" style={{fontWeight: '600'}}>Выберите проект:</label>
                <form onSubmit={this.handleSubmit}>
                    <Multiselect
                        options={this.state.projects}
                        placeholder="Проекты"
                        selectedValues={this.state.selectedProject ? [this.state.selectedProject] : []} 
                        onSelect={this.onSelect} 
                        onRemove={this.onSelect}
                        displayValue="title" 
                    />
                </form>
                {this.state.selectedProject && (
                    <div>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" htmlFor="name" style={{fontWeight:'600'}}>Название проекта</label>
                                <input 
                                className="form-control" 
                                type="text" 
                                name="name" 
                                value={this.state.selectedProject.title}
                                />
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" style={{fontWeight:'600'}}>Описание</label>
                                <textarea
                                className="form-control" 
                                type="text" 
                                value={this.state.selectedProject.description}
                                />
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" style={{fontWeight:'600'}}>Кол-во участников</label>
                                <input 
                                className="form-control" 
                                type="text"
                                value={this.state.selectedProject.count - this.state.selectedProject.participants_count} 
                                />
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" style={{fontWeight:'600'}}>Теги проекта</label>
                            <div>
                                {this.state.selectedProject.skills.map((skill, index) => (
                                    <span className="info-team" key={skill.id}>{skill} </span>
                                ))}
                            </div>
                            </div>
                        </div>
                        <div className='d-flex justify-content-end'>
                        <a
                            href={`/team/${this.state.selectedProject.id}`}
                                className="btn-next mt-3 " 
                                onClick={this.handleNextClick}
                                >Далее&nbsp;
                            </a>
                        </div>
                        <br/>
                    </div> 
                )}
            </div>
        )}
        </div>
        )}
      </div>
    )}
    </AuthContext.Consumer>
    )
  }
}
export default SearchTeamPage