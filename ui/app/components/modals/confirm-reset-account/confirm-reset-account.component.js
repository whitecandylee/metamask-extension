import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Modal, { ModalContent } from '../../modal'

export default class ConfirmResetAccount extends PureComponent {
  static propTypes = {
    resetAccount: PropTypes.func.isRequired,
  }

  static contextTypes = {
    t: PropTypes.func,
  }

  handleReset = () => {
    this.props.resetAccount()
      .then(() => this.props.hideModal())
  }

  render () {
    const { t } = this.context

    return (
      <Modal
        onSubmit={this.handleReset}
        submitText={t('reset')}
        cancelText={t('nevermind')}
        submitType="secondary"
      >
        <ModalContent
          title={`${t('resetAccount')}?`}
          description={t('resetAccountDescription')}
        />
      </Modal>
    )
  }
}
