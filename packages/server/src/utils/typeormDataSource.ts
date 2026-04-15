import { DataSource } from 'typeorm'
import { getDataSource } from '../DataSource.js'

export const dataSource: DataSource = getDataSource()
