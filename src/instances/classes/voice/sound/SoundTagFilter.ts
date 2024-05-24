export default function filterQuery(query: string) {
    return query.replace(/\W/g, '');
}
