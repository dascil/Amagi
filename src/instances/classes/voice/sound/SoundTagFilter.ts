export default function filterQuery(query: string) {
    return query.replace(/[,./<>/?'";:\[\]\\\(\){}`~!@#$%^&*-=+|\t ]/g, "");
}
