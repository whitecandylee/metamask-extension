import { connect } from 'react-redux'
import { hideModal } from '../../actions'

const mapStateToProps = state => {
  const { appState } = state
  const { props: modalProps } = appState.modal.modalState

  return {
    ...modalProps,
  }
}

export default function withModalProps (Component) {
  return connect(mapStateToProps)(Component)
}
