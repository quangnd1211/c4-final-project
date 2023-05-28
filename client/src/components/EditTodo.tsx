import * as React from 'react'
import { Form, Button, Divider, Checkbox, Dimmer, Loader, Image, Icon } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getTodo, getUploadUrl, uploadFile, patchTodo } from '../api/todos-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

enum FetchingDataState {
  Getting,
  Done
}


interface EditTodoProps {
  match: {
    params: {
      todoId: string
    }
  }
  auth: Auth
}

interface EditTodoState {
  todoId: string,
  name: string,
  done: boolean,
  dueDate: string,
  attachmentUrl?: string,
  file: any,
  loadingTodos: boolean,
  uploadState: UploadState,
  fetchingData: FetchingDataState
}

export class EditTodo extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    todoId: '',
    name: '',
    done: false,
    dueDate: '',
    attachmentUrl: undefined,
    file: undefined,
    loadingTodos: true,
    uploadState: UploadState.NoUpload,
    fetchingData: FetchingDataState.Getting
  }

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'file') {
      const files = event.target.files
      if (!files) return

      this.setState({
        file: files[0]
      })
    } else {
      this.setState({ name: value });
    }
  };

  handleCheckboxChange = (event: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      done: !this.state.done
    })
   
  };

  handleDeleteAttachmentFile = (event: React.SyntheticEvent) => {
    event.preventDefault()
    this.setState({
      attachmentUrl: undefined
    })
  }
  
  handleSubmit = async (event: React.SyntheticEvent) => {
    try {
      event.preventDefault()
      if (!this.state.name) {
        alert('Please enter todo name.')
        return
      }
      let uploadUrl = this.state.attachmentUrl
      if (this.state.file != undefined && this.state.file) {
        this.setUploadState(UploadState.FetchingPresignedUrl)
        uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.todoId)

        this.setUploadState(UploadState.UploadingFile)
        await uploadFile(uploadUrl, this.state.file)

      }
      await patchTodo(this.props.auth.getIdToken(), this.state.todoId, {
        name: this.state.name,
        dueDate: this.state.dueDate,
        done: this.state.done,
        attachmentUrl: uploadUrl
      })
      this.setUploadState(UploadState.UploadingFile)

      alert('Updated successul!')
    } catch (e) {
      alert('Could not update todo: ' + (e as Error).message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  } 

  onDeleteAttachmentUrl(event: React.SyntheticEvent) {
    event.preventDefault()

    this.setState({
      attachmentUrl: ''
    })
  }

  async componentDidMount() {
    try {
      const todo = await getTodo(this.props.auth.getIdToken(), this.props.match.params.todoId)
      this.setState({
        todoId: todo.todoId,
        name : todo.name,
        done : todo.done,
        dueDate: todo.dueDate,
        attachmentUrl: todo.attachmentUrl,
        loadingTodos: false,
        fetchingData: FetchingDataState.Done
      })
      
    } catch (e) {
      this.setState({fetchingData: FetchingDataState.Done})
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  } 

  render() {
    return (
      <div>
        <h1>Edit todo</h1>
        <Divider clearing />
        <Form warning>
          <Form.Group grouped>
            <label>Name:</label>
            <Form.Input
              name='name' 
              value={this.state.name}
              placeholder='To change the word...'
              onChange={this.handleChange} />
          </Form.Group>
          <Form.Group grouped>
            <label>File attachment:</label>
            <Form.Field>
               <Form.Input
                  name='file'
                  type="file"
                  accept="image/*"
                  placeholder="Image to upload"
                  onChange={this.handleChange}
                  disabled={this.state.attachmentUrl !== undefined && this.state.attachmentUrl !== ''}
                />
            </Form.Field>            
            <Form.Field className={this.state.attachmentUrl && this.state.attachmentUrl !== '' ? '' : 'd-none'}>
              <Image src={this.state.attachmentUrl} size="small" wrapped />
              <Button
                  icon
                  color="red"
                  onClick={this.handleDeleteAttachmentFile}
                >
                  <Icon name="delete" />
                </Button>
            </Form.Field>
          </Form.Group>
          <Form.Field>
            <Checkbox 
              label={{ children: 'Done Status' }}
              checked={this.state.done}
              onChange={this.handleCheckboxChange}
            />
          </Form.Field>          
          {this.renderButton()}
        </Form>
        <Dimmer active={this.state.fetchingData !== FetchingDataState.Done}>
          <Loader content="Loading" />
        </Dimmer>
      </div>
    )
  } 

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
          onClick={this.handleSubmit}
        >
          Save
        </Button>
      </div>
    )
  }
}

