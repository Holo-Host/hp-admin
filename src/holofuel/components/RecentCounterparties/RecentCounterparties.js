import React from 'react'
import { isEmpty } from 'lodash/fp'
import cx from 'classnames'
import HashIcon from 'holofuel/components/HashIcon'
import { presentAgentId } from 'utils'
import './RecentCounterparties.module.css'

export default function RecentCounterparties ({ agents = [], selectedAgentId, selectAgent, className }) {
  const recentAgents = agents.slice(0, 6)

  return <div styleName='recent-counterparties' className={className}>
    <h4 styleName='header'>Recent Peers</h4>
    {isEmpty(agents) && <div>You have no recent peers.</div>}
    {recentAgents.map(agent => <AgentRow
      agent={agent}
      selected={agent.id === selectedAgentId}
      selectThisAgent={() => selectAgent(agent.id)}
      key={agent.id}
    />)}
  </div>
}

function AgentRow ({ agent, selectThisAgent, selected }) {
  const agentName = agent.nickname || presentAgentId(agent.id)

  return <div styleName={cx('agent-row', { selected })} onClick={selectThisAgent} data-testid='agent-row'>
    <HashIcon hash={agent.id} size={32} styleName='avatar' />
    <div styleName='name-and-id'>
      <div styleName='name'>{agentName}</div>
      {agent.nickname && <div styleName='id'>{presentAgentId(agent.id)}</div>}
    </div>
    {selected && <div styleName='selected-indicator'>Selected</div>}
  </div>
}
