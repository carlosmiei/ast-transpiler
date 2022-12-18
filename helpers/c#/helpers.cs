namespace Main;

using System.Text.Json;
using dict = Dictionary<string, object>;


public partial class Helper
{
    public dict parseJson(object json)
    {
        return JsonSerializer.Deserialize<Dictionary<string, object>>((string)json);
    }

    public bool isTrue(object value)
    {
        if (value.GetType() == typeof(bool))
        {
            return (bool)value;
        }
        else if (value.GetType() == typeof(int))
        {
            return (int)value != 0;
        }
        else if (value.GetType() == typeof(string))
        {
            return (string)value != "";
        }
        else if (value.GetType() == typeof(List<object>))
        {
            return ((List<object>)value).Count > 0;
        }
        else
        {
            return false;
        }
    }

    public bool isEqual(object a, object b)
    {
        return a == b;
    }

    public bool isGreaterThan(object a, object b)
    {
        if (a.GetType() == typeof(int))
        {
            return (int)a > (int)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a > (double)b;
        }
        else if (a.GetType() == typeof(string))
        {
            return ((string)a).CompareTo((string)b) > 0;
        }
        else
        {
            return false;
        }
    }

    public bool isLessThan(object a, object b)
    {
        return !isGreaterThan(a, b);
    }

    public bool isGreaterThanOrEqual(object a, object b)
    {
        return isGreaterThan(a, b) || isEqual(a, b);
    }

    public bool isLessThanOrEqual(object a, object b)
    {
        return isLessThan(a, b) || isEqual(a, b);
    }

    public object add(object a, object b)
    {
        if (a.GetType() == typeof(int))
        {
            return (int)a + (int)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a + (double)b;
        }
        else if (a.GetType() == typeof(string))
        {
            return (string)a + (string)b;
        }
        else
        {
            return null;
        }
    }

    public string add(string a, string b)
    {
        return a + b;
    }

    public string add(string a, object b)
    {
        return add(a, b.ToString());
    }

    public string add(object a, string b)
    {
        return add(a, b.ToString());
    }

    public int add(int a, int b)
    {
        return a + b;
    }

    public float add(float a, float b)
    {
        return a + b;
    }

    public object subtract(object a, object b)
    {
        if (a.GetType() == typeof(int))
        {
            return (int)a - (int)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a - (double)b;
        }
        else
        {
            return null;
        }
    }

    public int subtract(int a, int b)
    {
        return a - b;
    }

    public float subtract(float a, float b)
    {
        return a - b;
    }

    public object divide(object a, object b)
    {
        if (a.GetType() == typeof(int))
        {
            return (int)a / (int)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a / (double)b;
        }
        else
        {
            return null;
        }
    }

    public object multiply(object a, object b)
    {
        if (a.GetType() == typeof(int))
        {
            return (int)a * (int)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a * (double)b;
        }
        else
        {
            return null;
        }
    }

    public int getArrayLength(object value)
    {
        if (value == null)
        {
            return 0;
        }

        if (value.GetType() == typeof(List<object>))
        {
            return ((List<object>)value).Count;
        }
        else if (value.GetType() == typeof(List<string>))
        {
            return ((List<string>)value).Count;
        }
        else
        {
            return 0;
        }
    }

    public object mathMin(object a, object b)
    {
        if (a.GetType() == typeof(int))
        {
            return Math.Min((int)a, (int)b);
        }
        else if (a.GetType() == typeof(double))
        {
            return Math.Min((double)a, (double)b);
        }
        else
        {
            return null;
        }
    }

    public object mathMax(object a, object b)
    {
        if (a.GetType() == typeof(int))
        {
            return Math.Max((int)a, (int)b);
        }
        else if (a.GetType() == typeof(double))
        {
            return Math.Max((double)a, (double)b);
        }
        else
        {
            return null;
        }
    }

    public int getIndexOf(object a, object b)
    {
        if (a.GetType() == typeof(List<object>))
        {
            return ((List<object>)a).IndexOf(b);
        }
        else if (a.GetType() == typeof(List<string>))
        {
            return ((List<string>)a).IndexOf((string)b);
        }
        else
        {
            return -1;
        }
    }

    public int parseInt(object a)
    {
        return int.Parse((string)a);
    }

    public float parseFloat(object a)
    {
        return float.Parse((string)a);
    }

    // generic getValue to replace elementAccesses
    public object getValue(object value, object key)
    {
        if (value == null)
        {
            return null;
        }

        if (value.GetType() == typeof(dict))
        {
            return ((dict)value)[(string)key];
        }
        else if (value.GetType() == typeof(List<object>))
        {
            var parsed = (int)key;
            return ((List<object>)value)[parsed];
        }
        else
        {
            return null;
        }
    }
}