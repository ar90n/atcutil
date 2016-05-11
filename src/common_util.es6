function get_url( contest, path )
{
    return 'http://' + contest + '.contest.atcoder.jp/' + path;
}

export default { get_url : get_url }
