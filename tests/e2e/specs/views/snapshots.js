describe('Snapshots', () => {
  beforeEach(() => {
    cy.deleteAllSnapshotRepositories()
    cy.quickConnect()
    cy.visit('/snapshots')
  })

  describe('Snapshot repositories', () => {
    it('can create a new snapshot repository with default settings', () => {
      let repositoryName = 'test-1'
      cy.get('#new_snapshot_repository').click()
      cy.get('#repository_name').type(repositoryName)
      cy.get('#repository_location').type(repositoryName)
      cy.get('#create_snapshot_repository').click()
      cy.get('#reload-snapshot-repositories').click()

      cy.get('table').should(table => {
        expect(table).to.contain(repositoryName)
      })
    })

    it('can create a new snapshot repository with custom settings', () => {
      let repositoryName = 'test-1'
      let chunkSize = '1m'
      let maxRestoreBytes = '20mb'
      let maxSnapshotBytes = '20mb'

      cy.get('#new_snapshot_repository').click()
      cy.get('#repository_name').type(repositoryName)
      cy.get('#repository_location').type(repositoryName)
      cy.get('#chunk_size').type(chunkSize)
      cy.get('#max_restore_bytes_per_sec').clear()
      cy.get('#max_restore_bytes_per_sec').type(maxRestoreBytes)
      cy.get('#max_snapshot_bytes_per_sec').clear()
      cy.get('#max_snapshot_bytes_per_sec').type(maxSnapshotBytes)
      cy.get('label[for="compress"]').click()
      cy.get('label[for="readonly"]').click()
      cy.get('#create_snapshot_repository').click()
      cy.get('#reload-snapshot-repositories').click()

      cy.getSnapshotRepository(repositoryName).then(response => {
        let settings = response.body[repositoryName].settings
        expect(settings.location).to.equal(repositoryName)
        expect(settings.chunk_size).to.equal(chunkSize)
        expect(settings.max_restore_bytes_per_sec).to.equal(maxRestoreBytes)
        expect(settings.max_snapshot_bytes_per_sec).to.equal(maxSnapshotBytes)
        expect(settings.compress).to.equal('false')
        expect(settings.readonly).to.equal('true')
      })
    })

    it('can delete snapshot repositories', () => {
      let repositoryName = 'test-1'
      cy.createSnapshotRepository(repositoryName)
      cy.get('#reload-snapshot-repositories').click()
      cy.get('tr').find('button').click()
      cy.get('tr').contains(repositoryName).should('not.exist')
    })

    it('can collapse snapshot repositories', () => {
      let repositoryName = 'test-1'
      cy.createSnapshotRepository(repositoryName)
      cy.get('#reload-snapshot-repositories').click()
      cy.get('button').contains('New snapshot').should('not.exist')
      cy.get('tr').contains(repositoryName).click()
      cy.get('button').contains('New snapshot').should('exist')
      cy.get('tr').contains(repositoryName).click()
      cy.get('button').contains('New snapshot').should('not.exist')
    })
  })

  describe('Snapshots', () => {
    const repositoryName = 'test-1'

    beforeEach(() => {
      cy.createSnapshotRepository(repositoryName)
    })

    it('can create a new snapshot with default settings', () => {
      cy.get('#reload-snapshot-repositories').click()
      cy.get('tr').contains(repositoryName).click()
      cy.get('button').contains('New snapshot').click()
      let snapshotName = 'snap-1'
      cy.get('#snapshot_name').type(snapshotName)
      cy.get('#create_snapshot').click()
      cy.get('tr').contains(snapshotName).should('exist')
    })

    it('can delete a snapshot', () => {
      let snapshotName = 'snap-1'
      cy.createNewSnapshot(repositoryName, snapshotName)
      cy.get('#reload-snapshot-repositories').click()
      cy.get('tr').contains(repositoryName).click()
      cy.get('tr').contains(snapshotName).get('button[title="Options"]').click()
      cy.get('tr').contains(snapshotName).get('div.v-list-item__content').contains('Delete snapshot').click()
      cy.get('tr').contains(snapshotName).get('button[title="Reload snapshots"]').click()
      cy.get('tr').contains(snapshotName).should('not.exist')
    })
  })
})
