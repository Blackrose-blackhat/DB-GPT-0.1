export function getAgent(dbUrl: string) {
    if (dbUrl.startsWith('mongodb://') || dbUrl.startsWith('mongodb+srv://')) {
        return import('./mongodb').then(m => m.MongoDBAgent);
    }
    // if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    //     return import('./postgres').then(m => m.PostgresAgent);
    // }
}