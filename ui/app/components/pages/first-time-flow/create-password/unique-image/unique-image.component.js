import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import Identicon from '../../../../identicon'
import Breadcrumbs from '../../../../breadcrumbs'
import Button from '../../../../button'
import { INITIALIZE_NOTICE_ROUTE } from '../../../../../routes'

export default class UniqueImageScreen extends PureComponent {
  static contextTypes = {
    t: PropTypes.func,
  }

  static propTypes = {
    address: PropTypes.string,
    history: PropTypes.object,
  }

  render () {
    const { t } = this.context

    return (
      <div>
        <Identicon
          className="first-time-flow__unique-image"
          address={this.props.address}
          diameter={70}
        />
        <div className="first-time-flow__header">
          Your unique account image
        </div>
        <div className="first-time-flow__text-block">
          This image was programmatically generated for you by your new account number.
        </div>
        <div className="first-time-flow__text-block">
          You’ll see this image everytime you need to confirm a transaction.
        </div>
        <Button
          type="first-time"
          className="first-time-flow__button"
          onClick={() => this.props.history.push(INITIALIZE_NOTICE_ROUTE)}
        >
          { t('next') }
        </Button>
        <Breadcrumbs
          className="first-time-flow__breadcrumbs"
          total={3}
          currentIndex={0}
        />
      </div>
    )
  }
}
