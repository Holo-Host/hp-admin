import React from 'react'
import { isEmpty } from 'lodash/fp'
import cx from 'classnames'
import HashIcon from 'holofuel/components/HashIcon'
import Loading from 'components/Loading'
import { presentAgentId } from 'utils'
import './RecentCounterparties.module.css'

export default function RecentCounterparties ({ agents = [], selectedAgentId, selectAgent, className, loading }) {
  const recentAgents = agents.slice(0, 6)

  return <div styleName='recent-counterparties' className={className}>
    <h4 styleName='header'>Recent Peers</h4>

    {loading && <Loading styleName='loading' />}

    {!loading && isEmpty(agents) && <div styleName='no-peers'>You have no recent peers.</div>}

    {recentAgents.map(agent => <AgentRow
      agent={agent}
      selected={agent.agentAddress === selectedAgentId}
      selectThisAgent={() => selectAgent(agent.agentAddress)}
      key={agent.agentAddress} />)}
  </div>
}

function AgentRow ({ agent, selectThisAgent, selected }) {
  const agentName = agent.nickname || presentAgentId(agent.agentAddress)

  return <div styleName={cx('agent-row', { selected })} onClick={selectThisAgent} data-testid='agent-row'>
    <HashIcon hash={agent.agentAddress} size={32} styleName='avatar' />
    <div styleName='name-and-id'>
      <div styleName='name'>{agentName}</div>
      {agent.nickname && <div styleName='id'>{presentAgentId(agent.agentAddress)}</div>}
    </div>
    {selected && <div styleName='selected-indicator'>Selected</div>}
  </div>
}
